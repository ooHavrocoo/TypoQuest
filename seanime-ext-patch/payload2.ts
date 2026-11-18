/// <reference path="../_external/.onlinestream-provider.d.ts" />
/// <reference path="../_external/core.d.ts" />

const DevMode = true;
const originalConsoleLog = console.log;
console.log = function (...args: any[]) {
    if (DevMode) {
        originalConsoleLog.apply(console, args);
    }
};

interface AnimeSeason {
    title: string;
    url: string;
    status: "COMPLETED" | "UNKNOWN";
    thumbnail: string;
    description: string;
    genre: string;
}

class Provider {
    readonly BASE_URL = "https://anime-sama.to";
    readonly CATALOGUE_URL = "https://anime-sama.to/catalogue/";
    readonly SEANIME_API = "http://127.0.0.1:43211/api/v1/proxy?url=";

    private readonly VOICES_VALUES = ["vostfr", "vf", "vf1", "vf2", "va", "vcn", "vj", "vkr", "vqc"];
    private readonly SUPPORTED_SERVERS = ["sibnet", "vk", "sendvid", "vidmoly", "movearnpre", "oneupload", "embed4me", "ansembed"];

    private static readonly TRAILING_SLASH_RE = /\/$/;
    private static readonly COMMENT_RE = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
    private static readonly SEASON_PANEL_RE = /panneauAnime\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g;
    private static readonly MOVIE_NAME_RE = /^\s*newSPF\("([^"]+)"\)/gm;
    private static readonly FILEVER_RE = /episodes\.js\?filever=(\d+)/;
    private static readonly EPISODE_ARRAY_RE = /var\s+eps\w*\s*=\s*\[([\s\S]*?)\];/g;
    private static readonly EPISODE_URL_RE = /'(https?:\/\/[^']+)'/g;
    private static readonly EPISODE_ITEM_RE = /["']((?:https?:\/\/[^"']+)|(?:lien:\d+))["']/g;
    private static readonly EPS_JETON_RE = /var\s+epsJeton\s*=\s*"([^"]+)"/;
    private static readonly LIEN_RE = /^lien:(\d+)$/;
    private static readonly JETON_SUFFIX_RE = /@@j=([\s\S]*)$/;
    private static readonly VIDMOLY_RE = /vidmoly\.to/g;
    private static readonly SCRIPT_TAG_RE = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    private static readonly PACKER_RE = /eval\(function\([^)]*\)\{[\s\S]*?\}\(\s*'([\s\S]*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]*?)'\.split\('\|'\)/;
    private static readonly VIDEO_URL_RE = /(?:https?:\/\/|\/)[^\s'"]+\.(?:m3u8|mp4)(?:\?[^\s'"]*)?/g;
    private static readonly QUERY_SPLIT_RE = /[\s:']+/;
    private static readonly SEASON_COMMAND_RE = /(creerListe|finirListe\w*|newSPF?)\s*\(([^)]*)\)/g;
    private static readonly RESET_LISTE_RE = /resetListe\s*\(\s*\)\s*;/g;
    private static readonly RESET_LISTE_FIRST_RE = /resetListe\s*\(\s*\)\s*;/;
    private static readonly FINIR_LISTE_CALL_RE = /finirListe\w*\s*\([^)]*\)/;

    _Server = "";

    getSettings(): Settings {
        return {
            episodeServers: this.SUPPORTED_SERVERS,
            supportsDub: true,
        };
    }

    private proxyFetch(targetUrl: string): Promise<Response> {
        return fetch(`${this.SEANIME_API}${encodeURIComponent(targetUrl)}`);
    }

    private stripComments(text: string): string {
        return text.replace(Provider.COMMENT_RE, "");
    }

    private async fetchAnimeSeasons(rawAnimeUrl: string): Promise<AnimeSeason[]> {
        try {
            const animeUrl = rawAnimeUrl.replace(Provider.TRAILING_SLASH_RE, "");

            const response = await this.proxyFetch(animeUrl);
            if (!response.ok) return [];

            const html = await response.text();
            const $ = await LoadDoc(html);

            const animeName = $("#titreOeuvre").text() || "";
            const thumbnail = $("#coverOeuvre").attr("src") || "";
            const description = $("h2:contains(synopsis)").next("p").text() || "";
            const genre = $("h2:contains(genres)").next("a").text() || "";

            const scripts = $("div.flex.flex-wrap").find("script").text();

            const uncommented = this.stripComments(scripts);

            const rawPanneaux: { seasonName: string; seasonStem: string }[] = [];
            let match: RegExpExecArray | null;

            Provider.SEASON_PANEL_RE.lastIndex = 0;

            while ((match = Provider.SEASON_PANEL_RE.exec(uncommented)) !== null) {
                rawPanneaux.push({ seasonName: match[1], seasonStem: match[2] });
            }

            const seenNames = new Set<string>();
            const dedupedPanneaux = rawPanneaux.filter(({ seasonName }) => {
                if (seenNames.has(seasonName)) return false;
                seenNames.add(seasonName);
                return true;
            });

            const seasonGroups = await Promise.all(dedupedPanneaux.map(async ({ seasonName, seasonStem }): Promise<AnimeSeason[]> => {
                if (seasonStem.includes("film")) {
                    const moviesUrl = `${animeUrl}/${seasonStem}`;
                    const moviePlayers = await this.fetchPlayers(moviesUrl);

                    if (moviePlayers.length === 0) return [];

                    const movieResponse = await this.proxyFetch(moviesUrl);
                    if (!movieResponse.ok) return [];

                    const movieHtml = await movieResponse.text();
                    const movieNames: string[] = [];
                    let nameMatch: RegExpExecArray | null;

                    Provider.MOVIE_NAME_RE.lastIndex = 0;

                    while ((nameMatch = Provider.MOVIE_NAME_RE.exec(movieHtml)) !== null) {
                        movieNames.push(nameMatch[1]);
                    }

                    const movieSeasons: AnimeSeason[] = [];

                    for (let i = 0; i < moviePlayers.length; i++) {
                        const title = movieNames.length > i ?
                            `${animeName} ${movieNames[i]}` :
                            moviePlayers.length === 1 ? `${animeName} Film` : `${animeName} Film ${i + 1}`;

                        movieSeasons.push({
                            title,
                            url: `${moviesUrl}#${i}`,
                            status: "COMPLETED",
                            thumbnail,
                            description,
                            genre
                        });
                    }

                    return movieSeasons;
                }

                return [{
                    title: `${animeName} ${seasonName}`,
                    url: `${animeUrl}/${seasonStem}`,
                    status: "UNKNOWN",
                    thumbnail,
                    description,
                    genre
                }];
            }));

            return seasonGroups.flat();
        } catch (error) {
            console.error("Error fetching anime seasons:", error);
            return [];
        }
    }

    private async fetchEpisodesJs(seasonUrl: string): Promise<{ js: string; pageHtml: string } | null> {
        const basePath = seasonUrl.replace(Provider.TRAILING_SLASH_RE, "");

        const pageResponse = await this.proxyFetch(`${basePath}/`);
        if (!pageResponse.ok) return null;

        const pageHtml = await pageResponse.text();
        const fileverMatch = pageHtml.match(Provider.FILEVER_RE);
        const episodesJsUrl = fileverMatch
            ? `${basePath}/episodes.js?filever=${fileverMatch[1]}`
            : `${basePath}/episodes.js`;

        const jsResponse = await this.proxyFetch(episodesJsUrl);
        if (!jsResponse.ok) {
            // 12/11/2026 : episodes.js n'existe plus, les episodes sont inline dans la page (var epsN = ["lien:...", ...])
            return { js: "", pageHtml };
        }

        return { js: await jsResponse.text(), pageHtml };
    }

    private extractSeasonScript(pageHtml: string): string {
        // 18/11/2026 : prendre le PREMIER resetListe() (script lancer() avec le vrai finirListe(N)).
        // Le dernier resetListe() de la page est dans un bloc de doc ("creerListe(debut, fin); newSP(special);...")
        // qui produisait de faux episodes speciaux et tronquait la liste.
        const firstReset = pageHtml.match(Provider.RESET_LISTE_FIRST_RE);

        if (!firstReset) {
            console.error("No resetListe() call found, falling back to full page scan");
            return pageHtml;
        }

        const spanStart = firstReset.index + firstReset[0].length;
        const remainder = pageHtml.slice(spanStart);
        const finirMatch = remainder.match(Provider.FINIR_LISTE_CALL_RE);
        const spanEnd = finirMatch ? spanStart + (finirMatch.index ?? 0) + finirMatch[0].length : pageHtml.length;

        return pageHtml.slice(spanStart, spanEnd);
    }

    private parseSeasonEpisodes(pageHtml: string, totalSlots: number): { number: number; isSpecial: boolean }[] {
        const seasonScript = this.extractSeasonScript(pageHtml);
        const uncommented = this.stripComments(seasonScript);
        const episodes: { number: number; isSpecial: boolean }[] = [];
        let lastInt = 0;
        let match: RegExpExecArray | null;

        Provider.SEASON_COMMAND_RE.lastIndex = 0;

        while ((match = Provider.SEASON_COMMAND_RE.exec(uncommented)) !== null && episodes.length < totalSlots) {
            const name = match[1];
            const args = match[2];

            if (name === "creerListe") {
                const [start, end] = args.split(",").map(a => parseInt(a.trim(), 10));
                if (Number.isNaN(start) || Number.isNaN(end)) {
                    console.error("Unexpected creerListe arguments:", args);
                    continue;
                }

                for (let i = start; i <= end && episodes.length < totalSlots; i++) {
                    episodes.push({ number: i, isSpecial: false });
                    lastInt = i;
                }
            } else if (name === "newSP" || name === "newSPF") {
                // ignorer les exemples de la doc du site (newSP(special)) : un vrai special a un titre entre quotes
                if (/^\s*["']/.test(args)) episodes.push({ number: 0, isSpecial: true });
            } else if (name.startsWith("finirListe")) {
                const start = parseInt(args.trim(), 10);
                if (Number.isNaN(start)) {
                    console.error("Unexpected finirListe arguments:", args);
                    continue;
                }

                let i = start;
                while (episodes.length < totalSlots) {
                    episodes.push({ number: i, isSpecial: false });
                    lastInt = i;
                    i++;
                }
            }
        }

        while (episodes.length < totalSlots) {
            lastInt += 1;
            episodes.push({ number: lastInt, isSpecial: false });
        }

        return episodes;
    }

    private parseEpisodeArrays(js: string): string[][] {
        const episodeArrays: string[][] = [];
        let match: RegExpExecArray | null;

        Provider.EPISODE_ARRAY_RE.lastIndex = 0;

        while ((match = Provider.EPISODE_ARRAY_RE.exec(js)) !== null) {
            const urls = (match[1].match(Provider.EPISODE_ITEM_RE) || [])
                .map(u => u.slice(1, -1).replace(Provider.VIDMOLY_RE, 'vidmoly.net'));

            if (urls.length > 0) {
                episodeArrays.push(urls);
            }
        }

        return episodeArrays;
    }

    private groupEpisodesByIndex(episodeArrays: string[][]): string[][] {
        const maxEpisodes = Math.max(...episodeArrays.map(arr => arr.length));
        const groups: string[][] = [];

        for (let episodeIndex = 0; episodeIndex < maxEpisodes; episodeIndex++) {
            const episodeUrls = episodeArrays
                .map(voiceArray => voiceArray[episodeIndex])
                .filter((url): url is string => !!url);

            if (episodeUrls.length > 0) {
                groups.push(episodeUrls);
            }
        }

        return groups;
    }

    private async fetchPlayers(url: string): Promise<string[][]> {
        try {
            const result = await this.fetchEpisodesJs(url);
            if (!result) return [];

            const episodeArrays = this.parseEpisodeArrays(result.js);
            if (episodeArrays.length === 0) return [];

            return this.groupEpisodesByIndex(episodeArrays);
        } catch (error) {
            console.error("Error fetching players:", error);
            return [];
        }
    }

    private async HandleServerUrl(serverUrl: string): Promise<VideoSource[]> {
        const req = await this.proxyFetch(serverUrl);
        if (!req.ok) {
            console.error("Failed to fetch server URL:", serverUrl, "Status:", req.status);
            return [];
        }

        const html = await req.text();

        function toBase(n: number, a: number): string {
            if (a >= 2 && a <= 36) return n.toString(a);
            // bases > 36 (packer 62) : Number.toString plante, on le fait a la main
            const digs = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if (n === 0) return "0";
            let s = "";
            while (n > 0) { s = digs.charAt(n % a) + s; n = Math.floor(n / a); }
            return s;
        }

        function unpack(p: string, a: number, c: number, k: string[]): string {
            while (c--) {
                if (k[c]) {
                    const token = toBase(c, a).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    p = p.replace(new RegExp('\\b' + token + '\\b', 'g'), k[c]);
                }
            }
            return p;
        }

        let unpacked: string | undefined;
        let match: RegExpExecArray | null;

        Provider.SCRIPT_TAG_RE.lastIndex = 0;

        while ((match = Provider.SCRIPT_TAG_RE.exec(html)) !== null) {
            const script = match[1];
            if (script.includes("eval(function(p,a,c,k,e,d)")) {
                const unpackMatch = script.match(Provider.PACKER_RE);

                if (unpackMatch) {
                    try {
                        const packed = unpackMatch[1];
                        const base = parseInt(unpackMatch[2], 10);
                        const count = parseInt(unpackMatch[3], 10);
                        const dict = unpackMatch[4].split('|');

                        unpacked = unpack(packed, base, count, dict);
                    } catch (e) {
                        // unpack KO (base > 36 etc.) : on se contente du HTML brut
                        console.error("unpack failed, falling back to raw html", e);
                    }
                    break;
                }
            }
        }

        // Look for video URLs
        const searchSource = unpacked ? `${html}\n${unpacked}` : html;
        const videoUrls = searchSource.match(Provider.VIDEO_URL_RE) || [];

        const videos: VideoSource[] = [];

        let origin = "";
        try {
            const urlObj = new URL(serverUrl);
            origin = urlObj.origin;
        } catch (error) {
            console.error("Failed to parse server URL for origin:", serverUrl);
        }

        for (const url of videoUrls) {
            let finalUrl = url;
            if (url.startsWith("/") && !url.startsWith("//")) {
                if (origin === "") continue;
                finalUrl = origin + url;
            } else if (url.startsWith("//")) {
                finalUrl = `https:${url}`;
            }
            const type = finalUrl.includes('.m3u8') ? 'm3u8' : 'mp4';
            videos.push({
                url: finalUrl,
                type: type as VideoSourceType,
                quality: `${this._Server} - unknown`,
                subtitles: []
            });
        }

        return videos;
    }

    async search(opts: SearchOptions): Promise<SearchResult[]> {
        let tempquery = opts.query;

        while (tempquery !== "") {
            console.log(`Searching for query: "${tempquery}".`);

            const searchUrl = new URL(this.CATALOGUE_URL);
            searchUrl.searchParams.set("search", tempquery);
            searchUrl.searchParams.set("page", "1");

            const response = await fetch(searchUrl.toString());
            if (!response.ok) {
                tempquery = tempquery.split(Provider.QUERY_SPLIT_RE).slice(0, -1).join(" ");
                continue;
            }

            const html = await response.text();
            const $ = await LoadDoc(html);
            const searchResults = $("#list_catalog > div a");

            if (searchResults.length() <= 0) {
                tempquery = tempquery.split(Provider.QUERY_SPLIT_RE).slice(0, -1).join(" ");
                continue;
            }

            const firstResult = searchResults.first();
            const animeUrl = firstResult.attr("href");

            if (!animeUrl) {
                return [];
            }

            console.log("Found anime URL:", animeUrl);

            const seasons = await this.fetchAnimeSeasons(animeUrl);

            if (seasons.length === 0) {
                return [];
            }

            return await Promise.all(seasons.map(async (season: AnimeSeason): Promise<SearchResult> => {
                let finalUrl = season.url;

                if (opts.dub && !finalUrl.includes("film")) {
                    const dubUrl = finalUrl.replace("/vostfr", "/vf");
                    const dubResponse = await this.proxyFetch(dubUrl);
                    if (dubResponse.ok) {
                        finalUrl = dubUrl;
                    } else {
                        const vf1Url = dubUrl + "1";
                        const vf1Response = await this.proxyFetch(vf1Url);
                        if (vf1Response.ok) {
                            finalUrl = vf1Url;
                        }
                    }
                }

                return {
                    id: finalUrl,
                    title: season.title,
                    url: finalUrl,
                    subOrDub: opts.dub ? "dub" : "sub",
                };
            }));
        }

        return [];
    }

    async findEpisodes(id: string): Promise<EpisodeDetails[]> {
        const animeUrl = id.split("#")[0];
        const movieIndex = id.split("#")[1];

        const result = await this.fetchEpisodesJs(animeUrl);

        if (!result) {
            console.error("Failed to fetch episodes.js");
            return [];
        }

        const { js: episodesText, pageHtml } = result;
        const episodeDetails: EpisodeDetails[] = [];
        let episodeArrays = this.parseEpisodeArrays(episodesText);
        if (episodeArrays.length === 0) {
            // fallback 12/11/2026 : episodes inline dans le HTML de la page
            episodeArrays = this.parseEpisodeArrays(pageHtml);
        }

        const jetonMatch = pageHtml.match(Provider.EPS_JETON_RE);
        const jetonSuffix = jetonMatch ? `@@j=${jetonMatch[1]}` : "";

        if (episodeArrays.length === 0) {
            return [];
        }

        if (movieIndex !== undefined) {
            const movieIdx = parseInt(movieIndex, 10);
            const movieUrls: string[] = [];

            for (const voiceArray of episodeArrays) {
                if (voiceArray[movieIdx]) {
                    movieUrls.push(voiceArray[movieIdx]);
                }
            }

            if (movieUrls.length > 0) {
                return [{
                    id: movieUrls.join(",") + jetonSuffix,
                    url: id,
                    number: 1
                }];
            }
            return [];
        }

        const groups = this.groupEpisodesByIndex(episodeArrays);
        const seasonEpisodes = this.parseSeasonEpisodes(pageHtml, groups.length);

        groups.forEach((episodeUrls, episodeIndex) => {
            const { number, isSpecial } = seasonEpisodes[episodeIndex];
            if (isSpecial) return;

            episodeDetails.push({
                id: episodeUrls.join(",") + jetonSuffix,
                url: id,
                number
            });
        });

        return episodeDetails.reverse();
    }

    async findEpisodeServer(episode: EpisodeDetails, _server: string): Promise<EpisodeServer> {
        this._Server = _server;
        let rawId = episode.id;
        const jetonMatch = rawId.match(Provider.JETON_SUFFIX_RE);
        let jeton = "";
        if (jetonMatch) {
            jeton = jetonMatch[1];
            rawId = rawId.slice(0, jetonMatch.index);
        }
        const servers = rawId.split(",");

        // 12/11/2026 : les episodes sont des "lien:<n>" resolus via /api/lien.php?j=<jeton>&l=<n>
        let serverUrl: string | undefined;
        let resolvedFallback = "";
        for (const candidate of servers) {
            let url = candidate;
            const lienMatch = candidate.match(Provider.LIEN_RE);
            if (lienMatch) {
                if (!jeton) continue;
                try {
                    const resp = await this.proxyFetch(`${this.BASE_URL}/api/lien.php?j=${encodeURIComponent(jeton)}&l=${lienMatch[1]}`);
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data && data.u) url = data.u;
                    }
                } catch (e) {
                    console.error("Failed to resolve lien:", candidate, e);
                }
                if (!url.startsWith("http")) continue;
            }
            if (!resolvedFallback) resolvedFallback = url;
            const parts = url.split("/");
            const domain = parts[2];
            if (!domain) continue;

            const domainParts = domain.split(".");
            const serverName = domainParts.length >= 3 ? domainParts[1] : domainParts[0];
            if (serverName === _server) {
                serverUrl = url;
                break;
            }
        }
        if (!serverUrl) serverUrl = resolvedFallback || undefined;

        if (serverUrl && _server !== "") {
            console.log(`Handling server URL: ${serverUrl}`);
            const videoSources = await this.HandleServerUrl(serverUrl);

            if (videoSources.length > 0) {
                const referer = serverUrl.split("/").slice(0, 3).join("/");
                return {
                    headers: { referer: referer },
                    server: _server,
                    videoSources: videoSources
                };
            }
        }

        console.log(`Server not found: ${_server}`);
        return <EpisodeServer>{
            headers: {},
            server: "",
            videoSources: []
        };
    }
}