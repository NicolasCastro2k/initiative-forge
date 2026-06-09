import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { prisma } from "../lib/prisma.js";
import { getAuthUser } from "../lib/getAuthUser.js";

export const charactersRouter = Router();

const uploadsRoot = path.join(process.cwd(), "uploads");
const characterUploadsDir = path.join(uploadsRoot, "characters");

fs.mkdirSync(characterUploadsDir, {
  recursive: true,
});

const imageStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, characterUploadsDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    callback(null, safeName);
  },
});

const uploadCharacterImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("Solo se permiten imágenes JPG, PNG, WEBP o GIF."));
      return;
    }

    callback(null, true);
  },
});

function toStringOrNull(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const stringValue = String(value).trim();

  return stringValue.length > 0 ? stringValue : null;
}

function toIntOrFallback(value: unknown, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue)) {
    return fallback;
  }

  return numberValue;
}

function getDefaultSheetData(characterName: string) {
  return {
    identity: {
      playerName: "",
      characterName,
      className: "",
      subclassName: "",
      level: 1,
      background: "",
      race: "",
      alignment: "",
      experience: 0,
    },
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    combat: {
      armorClass: 10,
      initiative: 0,
      speed: 30,
      maxHp: 10,
      currentHp: 10,
      temporaryHp: 0,
      hitDiceTotal: "1d8",
      hitDiceCurrent: "1d8",
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
    },
    proficiencies: {
      proficiencyBonus: 2,
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: false,
        wisdom: false,
        charisma: false,
      },
      skills: {
        acrobatics: false,
        animalHandling: false,
        arcana: false,
        athletics: false,
        deception: false,
        history: false,
        insight: false,
        intimidation: false,
        investigation: false,
        medicine: false,
        nature: false,
        perception: false,
        performance: false,
        persuasion: false,
        religion: false,
        sleightOfHand: false,
        stealth: false,
        survival: false,
      },
      languages: [],
      tools: [],
      armor: [],
      weapons: [],
    },
    attacks: [],
    equipment: [],
    currency: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
    },
    personality: {
      traits: "",
      ideals: "",
      bonds: "",
      flaws: "",
    },
    features: [],
    spells: {
      spellcastingClass: "",
      spellcastingAbility: "",
      spellSaveDc: 0,
      spellAttackBonus: 0,
      slots: {
        "1": {
          total: 0,
          expended: 0,
        },
        "2": {
          total: 0,
          expended: 0,
        },
        "3": {
          total: 0,
          expended: 0,
        },
        "4": {
          total: 0,
          expended: 0,
        },
        "5": {
          total: 0,
          expended: 0,
        },
        "6": {
          total: 0,
          expended: 0,
        },
        "7": {
          total: 0,
          expended: 0,
        },
        "8": {
          total: 0,
          expended: 0,
        },
        "9": {
          total: 0,
          expended: 0,
        },
      },
      spellsByLevel: {
        "0": [],
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
        "7": [],
        "8": [],
        "9": [],
      },
    },
  };
}

charactersRouter.get("/characters", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const characters = await prisma.character.findMany({
      where: {
        ownerUserId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json({
      characters,
    });
  } catch (error) {
    console.error("Error en GET /characters:", error);

    return res.status(500).json({
      message: "Error interno al cargar personajes.",
    });
  }
});

charactersRouter.post("/characters", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const name = String(req.body.name ?? "").trim();

    if (!name) {
      return res.status(400).json({
        message: "El nombre del personaje es obligatorio.",
      });
    }

    const level = toIntOrFallback(req.body.level, 1);

    const character = await prisma.character.create({
      data: {
        ownerUserId: user.id,
        name,
        raceId: toStringOrNull(req.body.raceId),
        classId: toStringOrNull(req.body.classId),
        subclassId: toStringOrNull(req.body.subclassId),
        backgroundId: toStringOrNull(req.body.backgroundId),
        level,
        sheetData: req.body.sheetData ?? getDefaultSheetData(name),
      },
    });

    return res.status(201).json({
      character,
    });
  } catch (error) {
    console.error("Error en POST /characters:", error);

    return res.status(500).json({
      message: "Error interno al crear personaje.",
    });
  }
});

charactersRouter.get("/characters/:characterId", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const characterId = String(req.params.characterId);

    const character = await prisma.character.findUnique({
      where: {
        id: characterId,
      },
    });

    if (!character || character.ownerUserId !== user.id) {
      return res.status(404).json({
        message: "Personaje no encontrado.",
      });
    }

    return res.json({
      character,
    });
  } catch (error) {
    console.error("Error en GET /characters/:characterId:", error);

    return res.status(500).json({
      message: "Error interno al cargar personaje.",
    });
  }
});

charactersRouter.put("/characters/:characterId", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const characterId = String(req.params.characterId);

    const existingCharacter = await prisma.character.findUnique({
      where: {
        id: characterId,
      },
    });

    if (!existingCharacter || existingCharacter.ownerUserId !== user.id) {
      return res.status(404).json({
        message: "Personaje no encontrado.",
      });
    }

    const name = String(req.body.name ?? existingCharacter.name).trim();

    if (!name) {
      return res.status(400).json({
        message: "El nombre del personaje es obligatorio.",
      });
    }

    const character = await prisma.character.update({
      where: {
        id: characterId,
      },
      data: {
        name,
        raceId:
          req.body.raceId !== undefined
            ? toStringOrNull(req.body.raceId)
            : existingCharacter.raceId,
        classId:
          req.body.classId !== undefined
            ? toStringOrNull(req.body.classId)
            : existingCharacter.classId,
        subclassId:
          req.body.subclassId !== undefined
            ? toStringOrNull(req.body.subclassId)
            : existingCharacter.subclassId,
        backgroundId:
          req.body.backgroundId !== undefined
            ? toStringOrNull(req.body.backgroundId)
            : existingCharacter.backgroundId,
        level:
          req.body.level !== undefined
            ? toIntOrFallback(req.body.level, existingCharacter.level)
            : existingCharacter.level,
        sheetData:
          req.body.sheetData !== undefined
            ? req.body.sheetData
            : existingCharacter.sheetData,
      },
    });

    return res.json({
      character,
    });
  } catch (error) {
    console.error("Error en PUT /characters/:characterId:", error);

    return res.status(500).json({
      message: "Error interno al actualizar personaje.",
    });
  }
});

charactersRouter.post(
  "/characters/:characterId/image",
  uploadCharacterImage.single("image"),
  async (req, res) => {
    try {
      const user = getAuthUser(req);

      if (!user) {
        return res.status(401).json({
          message: "Debes iniciar sesión.",
        });
      }

      const characterId = String(req.params.characterId);

      const existingCharacter = await prisma.character.findUnique({
        where: {
          id: characterId,
        },
      });

      if (!existingCharacter || existingCharacter.ownerUserId !== user.id) {
        return res.status(404).json({
          message: "Personaje no encontrado.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Debes subir una imagen.",
        });
      }

      const imagePath = `/uploads/characters/${req.file.filename}`;

      const character = await prisma.character.update({
        where: {
          id: characterId,
        },
        data: {
          portraitImagePath: imagePath,
          tokenImagePath: imagePath,
        },
      });

      return res.json({
        character,
        imagePath,
        message: "Imagen actualizada.",
      });
    } catch (error) {
      console.error("Error en POST /characters/:characterId/image:", error);

      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Error interno al subir imagen.",
      });
    }
  }
);

charactersRouter.delete("/characters/:characterId", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const characterId = String(req.params.characterId);

    const existingCharacter = await prisma.character.findUnique({
      where: {
        id: characterId,
      },
    });

    if (!existingCharacter || existingCharacter.ownerUserId !== user.id) {
      return res.status(404).json({
        message: "Personaje no encontrado.",
      });
    }

    await prisma.character.delete({
      where: {
        id: characterId,
      },
    });

    return res.json({
      ok: true,
      message: "Personaje eliminado.",
    });
  } catch (error) {
    console.error("Error en DELETE /characters/:characterId:", error);

    return res.status(500).json({
      message: "Error interno al eliminar personaje.",
    });
  }
});
