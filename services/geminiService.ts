
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter with process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFunnySentences = async (difficulty: string, language: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Génère 10 phrases courtes, amusantes et adaptées aux enfants sur le thème de l'espace en ${language}. 
                 Difficulté : ${difficulty}. 
                 REGLE CRITIQUE : N'utilise JAMAIS de majuscules accentuées (comme É, À, È, Ç, Ô). 
                 Remplace-les toujours par des majuscules simples (E, A, E, C, O) car elles sont trop difficiles à taper sur un clavier standard.
                 Les minuscules accentuées (é, à, è, ç) sont autorisées car elles sont faciles.
                 Les phrases doivent être captivantes et faciles à taper au clavier.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return [
      "L'astronaute mange une pizza galactique.",
      "Le robot danse sur la Lune.",
      "Une étoile filante fait un clin d'oeil.",
      "Le chat de l'espace poursuit une souris-comète.",
      "Le Soleil porte des lunettes noires.",
      "La fusée ronfle très fort.",
      "Une pluie de bonbons tombe sur Mars.",
      "Le petit alien joue de la guitare.",
      "Venus est une grosse boule de glace au chocolat.",
      "Saturne utilise ses anneaux comme un hula-hoop."
    ];
  } catch (error) {
    console.error("Error generating sentences:", error);
    return [
      "Le petit alien vert rigole.",
      "Mars est une boule de feu orange.",
      "Le vaisseau spatial fait vroom vroom.",
      "Les étoiles chantent une berceuse.",
      "La Lune est un gros fromage.",
      "Un Martien fait du vélo.",
      "La poussière d'étoile brille.",
      "Le robot répare sa jambe.",
      "Un trou noir mange un biscuit.",
      "Le commandant salue son équipe."
    ];
  }
};
