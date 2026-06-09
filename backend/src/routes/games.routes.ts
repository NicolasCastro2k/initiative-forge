import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getAuthUser } from "../lib/getAuthUser.js";

export const gamesRouter = Router();

function generateInviteCode() {
return Math.random().toString(36).slice(2, 8).toUpperCase();
}

type SheetDataRecord = Record<string, any>;

function asSheetData(value: unknown): SheetDataRecord {
if (!value || typeof value !== "object" || Array.isArray(value)) {
return {};
}

return value as SheetDataRecord;
}

function getAbilityModifier(score: unknown) {
const numberScore = Number(score);

if (!Number.isFinite(numberScore)) {
return 0;
}

return Math.floor((numberScore - 10) / 2);
}

function getAverageHpGain(hitDie: number, constitutionScore: unknown) {
const averageHitDie = Math.floor(hitDie / 2) + 1;
const constitutionModifier = getAbilityModifier(constitutionScore);

return Math.max(1, averageHitDie + constitutionModifier);
}

function getSubclassUnlockLevel(classId: string | null) {
if (!classId) return null;

const levelOneClasses = ["cleric"];
const levelTwoClasses = ["druid", "wizard"];

if (levelOneClasses.includes(classId)) {
return 1;
}

if (levelTwoClasses.includes(classId)) {
return 2;
}

return 3;
}

function getAsiLevels(classId: string | null) {
const baseAsiLevels = [4, 8, 12, 16, 19];

if (classId === "fighter") {
return [4, 6, 8, 12, 14, 16, 19];
}

if (classId === "rogue") {
return [4, 8, 10, 12, 16, 19];
}

return baseAsiLevels;
}

function getProficiencyBonus(level: number) {
if (level >= 17) return 6;
if (level >= 13) return 5;
if (level >= 9) return 4;
if (level >= 5) return 3;
return 2;
}

function hasFeature(
features: Array<{ name: string; description: string }>,
name: string
) {
return features.some((feature) => feature.name === name);
}

function normalizeFeatureList(value: unknown) {
if (!Array.isArray(value)) {
return [];
}

return value
.filter((item) => item && typeof item === "object")
.map((item) => {
const record = item as Record<string, unknown>;


  return {
    name: String(record.name ?? ""),
    description: String(record.description ?? ""),
  };
})
.filter((item) => item.name.trim().length > 0);


}

function normalizePendingChoices(value: unknown) {
if (!Array.isArray(value)) {
return [];
}

return value.filter((item) => item && typeof item === "object");
}

function normalizeLevelHistory(value: unknown) {
if (!Array.isArray(value)) {
return [];
}

return value.filter((item) => item && typeof item === "object");
}

async function getUserMembership(gameId: string, userId: string) {
return prisma.gameMember.findUnique({
where: {
gameId_userId: {
gameId,
userId,
},
},
});
}

gamesRouter.get("/", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const memberships = await prisma.gameMember.findMany({
  where: {
    userId: user.id,
  },
  include: {
    game: {
      include: {
        dm: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: true,
      },
    },
  },
  orderBy: {
    joinedAt: "desc",
  },
});

const games = memberships.map((membership) => ({
  ...membership.game,
  role: membership.role,
}));

return res.json({
  games,
});


} catch (error) {
console.error("Error en GET /games:", error);


return res.status(500).json({
  message: "Error interno al cargar partidas.",
});


}
});

gamesRouter.post("/", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const name = String(req.body.name ?? "").trim();
const description = String(req.body.description ?? "").trim();

if (!name) {
  return res.status(400).json({
    message: "El nombre de la partida es obligatorio.",
  });
}

let inviteCode = generateInviteCode();

for (let attempts = 0; attempts < 5; attempts += 1) {
  const existingGame = await prisma.game.findUnique({
    where: {
      inviteCode,
    },
  });

  if (!existingGame) break;

  inviteCode = generateInviteCode();
}

const game = await prisma.game.create({
  data: {
    name,
    description: description || null,
    inviteCode,
    dmUserId: user.id,
    members: {
      create: {
        userId: user.id,
        role: "DM",
      },
    },
  },
  include: {
    dm: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    members: true,
  },
});

return res.status(201).json({
  game: {
    ...game,
    role: "DM",
  },
});


} catch (error) {
console.error("Error en POST /games:", error);


return res.status(500).json({
  message: "Error interno al crear partida.",
});


}
});

gamesRouter.post("/join", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const inviteCode = String(req.body.inviteCode ?? "").trim().toUpperCase();

if (!inviteCode) {
  return res.status(400).json({
    message: "El código de invitación es obligatorio.",
  });
}

const game = await prisma.game.findUnique({
  where: {
    inviteCode,
  },
});

if (!game) {
  return res.status(404).json({
    message: "No existe una partida con ese código.",
  });
}

const membership = await prisma.gameMember.upsert({
  where: {
    gameId_userId: {
      gameId: game.id,
      userId: user.id,
    },
  },
  update: {},
  create: {
    gameId: game.id,
    userId: user.id,
    role: "PLAYER",
  },
});

return res.json({
  game,
  membership,
});


} catch (error) {
console.error("Error en POST /games/join:", error);


return res.status(500).json({
  message: "Error interno al unirse a partida.",
});


}
});

gamesRouter.get("/:gameId/characters", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const gameId = String(req.params.gameId);

const membership = await getUserMembership(gameId, user.id);

if (!membership) {
  return res.status(404).json({
    message: "Partida no encontrada o no tienes acceso.",
  });
}

const selections = await prisma.gameCharacter.findMany({
  where: {
    gameId,
    isActive: true,
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    character: true,
  },
  orderBy: {
    selectedAt: "asc",
  },
});

const availableCharacters = await prisma.character.findMany({
  where: {
    ownerUserId: user.id,
  },
  orderBy: {
    updatedAt: "desc",
  },
});

return res.json({
  selections,
  activeCharacters: selections,
  availableCharacters,
  role: membership.role,
});


} catch (error) {
console.error("Error en GET /games/:gameId/characters:", error);


return res.status(500).json({
  message: "Error interno al cargar personajes de la partida.",
});


}
});

gamesRouter.post("/:gameId/characters/select", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const gameId = String(req.params.gameId);
const characterId = String(req.body.characterId ?? "");

if (!characterId) {
  return res.status(400).json({
    message: "Debes elegir un personaje.",
  });
}

const membership = await getUserMembership(gameId, user.id);

if (!membership) {
  return res.status(404).json({
    message: "Partida no encontrada o no tienes acceso.",
  });
}

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

const selection = await prisma.gameCharacter.upsert({
  where: {
    gameId_userId_characterId: {
      gameId,
      userId: user.id,
      characterId,
    },
  },
  update: {
    isActive: true,
    selectedAt: new Date(),
  },
  create: {
    gameId,
    userId: user.id,
    characterId,
    isActive: true,
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    character: true,
  },
});

return res.status(201).json({
  selection,
});


} catch (error) {
console.error("Error en POST /games/:gameId/characters/select:", error);


return res.status(500).json({
  message: "Error interno al seleccionar personaje.",
});


}
});

gamesRouter.delete("/:gameId/characters/:selectionId", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const gameId = String(req.params.gameId);
const selectionId = String(req.params.selectionId);

const membership = await getUserMembership(gameId, user.id);

if (!membership) {
  return res.status(404).json({
    message: "Partida no encontrada o no tienes acceso.",
  });
}

const selection = await prisma.gameCharacter.findUnique({
  where: {
    id: selectionId,
  },
  include: {
    character: true,
  },
});

if (!selection || selection.gameId !== gameId) {
  return res.status(404).json({
    message: "Selección no encontrada.",
  });
}

const isDm = membership.role === "DM";
const isOwner = selection.userId === user.id;

if (!isDm && !isOwner) {
  return res.status(403).json({
    message: "No puedes quitar este personaje.",
  });
}

const updatedSelection = await prisma.gameCharacter.update({
  where: {
    id: selection.id,
  },
  data: {
    isActive: false,
  },
});

return res.json({
  ok: true,
  selection: updatedSelection,
});


} catch (error) {
console.error("Error en DELETE /games/:gameId/characters/:selectionId:", error);


return res.status(500).json({
  message: "Error interno al quitar personaje de partida.",
});


}
});

gamesRouter.post(
"/:gameId/characters/:characterId/level-up",
async (req, res) => {
try {
const user = getAuthUser(req);


  if (!user) {
    return res.status(401).json({
      message: "Debes iniciar sesión.",
    });
  }

  const gameId = String(req.params.gameId);
  const characterId = String(req.params.characterId);

  const membership = await getUserMembership(gameId, user.id);

  if (!membership || membership.role !== "DM") {
    return res.status(403).json({
      message: "Solo el DM puede subir de nivel personajes en esta partida.",
    });
  }

  const selection = await prisma.gameCharacter.findFirst({
    where: {
      gameId,
      characterId,
      isActive: true,
    },
    include: {
      character: true,
    },
  });

  if (!selection) {
    return res.status(404).json({
      message: "Ese personaje no está activo en esta partida.",
    });
  }

  const character = selection.character;
  const currentLevel = character.level;
  const nextLevel = currentLevel + 1;

  if (currentLevel >= 20) {
    return res.status(400).json({
      message: "El personaje ya está en nivel 20.",
    });
  }

  const classPreset = character.classId
    ? await prisma.classPreset.findUnique({
        where: {
          id: character.classId,
        },
        include: {
          features: {
            where: {
              level: {
                gt: currentLevel,
                lte: nextLevel,
              },
            },
            orderBy: {
              level: "asc",
            },
          },
        },
      })
    : null;

  const subclassPreset = character.subclassId
    ? await prisma.subclassPreset.findUnique({
        where: {
          id: character.subclassId,
        },
        include: {
          features: {
            where: {
              level: {
                gt: currentLevel,
                lte: nextLevel,
              },
            },
            orderBy: {
              level: "asc",
            },
          },
        },
      })
    : null;

  const hitDie = classPreset?.hitDie ?? 8;
  const sheetData = asSheetData(character.sheetData);

  const identity = asSheetData(sheetData.identity);
  const abilities = asSheetData(sheetData.abilities);
  const combat = asSheetData(sheetData.combat);
  const proficiencies = asSheetData(sheetData.proficiencies);

  const hpGain = getAverageHpGain(hitDie, abilities.constitution);
  const currentMaxHp = Number(combat.maxHp ?? 0);
  const currentHp = Number(combat.currentHp ?? 0);

  const nextMaxHp = Math.max(1, currentMaxHp + hpGain);
  const nextCurrentHp = Math.max(1, currentHp + hpGain);

  const existingFeatures = normalizeFeatureList(sheetData.features);
  const nextFeatures = [...existingFeatures];

  const unlockedClassFeatures =
    classPreset?.features.map((feature) => ({
      name: `${feature.name} (Clase nivel ${feature.level})`,
      description: feature.summary,
    })) ?? [];

  for (const feature of unlockedClassFeatures) {
    if (!hasFeature(nextFeatures, feature.name)) {
      nextFeatures.push(feature);
    }
  }

  const unlockedSubclassFeatures =
    subclassPreset?.features.map((feature) => ({
      name: `${feature.name} (Subclase nivel ${feature.level})`,
      description: feature.summary,
    })) ?? [];

  for (const feature of unlockedSubclassFeatures) {
    if (!hasFeature(nextFeatures, feature.name)) {
      nextFeatures.push(feature);
    }
  }

  const pendingChoices = normalizePendingChoices(
    sheetData.pendingLevelChoices
  );

  const subclassUnlockLevel = getSubclassUnlockLevel(character.classId);

  if (
    subclassUnlockLevel !== null &&
    nextLevel >= subclassUnlockLevel &&
    !character.subclassId
  ) {
    const alreadyPendingSubclass = pendingChoices.some((choice) => {
      const record = choice as Record<string, unknown>;

      return (
        record.type === "SUBCLASS" &&
        record.classId === character.classId
      );
    });

    if (!alreadyPendingSubclass) {
      pendingChoices.push({
        type: "SUBCLASS",
        level: nextLevel,
        classId: character.classId,
        message: "Elegir subclase.",
        createdAt: new Date().toISOString(),
      });
    }
  }

  const asiLevels = getAsiLevels(character.classId);

  if (asiLevels.includes(nextLevel)) {
    const alreadyPendingAsi = pendingChoices.some((choice) => {
      const record = choice as Record<string, unknown>;

      return (
        record.type === "ABILITY_SCORE_IMPROVEMENT" &&
        record.level === nextLevel
      );
    });

    if (!alreadyPendingAsi) {
      pendingChoices.push({
        type: "ABILITY_SCORE_IMPROVEMENT",
        level: nextLevel,
        message: "Pendiente mejora de característica o dote.",
        createdAt: new Date().toISOString(),
      });
    }
  }

  const levelHistory = normalizeLevelHistory(sheetData.levelHistory);

  levelHistory.push({
    fromLevel: currentLevel,
    toLevel: nextLevel,
    hpGain,
    hitDie,
    classId: character.classId,
    subclassId: character.subclassId,
    unlockedClassFeatures,
    unlockedSubclassFeatures,
    createdAt: new Date().toISOString(),
    createdByUserId: user.id,
  });

  const nextSheetData = {
    ...sheetData,
    identity: {
      ...identity,
      level: nextLevel,
      className: classPreset?.name ?? identity.className ?? "",
      subclassName: subclassPreset?.name ?? identity.subclassName ?? "",
    },
    combat: {
      ...combat,
      maxHp: nextMaxHp,
      currentHp: nextCurrentHp,
      hitDiceTotal: `${nextLevel}d${hitDie}`,
      hitDiceCurrent: `${nextLevel}d${hitDie}`,
    },
    proficiencies: {
      ...proficiencies,
      proficiencyBonus: getProficiencyBonus(nextLevel),
    },
    features: nextFeatures,
    pendingLevelChoices: pendingChoices,
    levelHistory,
  };

  const updatedCharacter = await prisma.character.update({
    where: {
      id: character.id,
    },
    data: {
      level: nextLevel,
      sheetData: nextSheetData,
    },
  });

  return res.json({
    character: updatedCharacter,
    levelUp: {
      fromLevel: currentLevel,
      toLevel: nextLevel,
      hpGain,
      unlockedClassFeatures,
      unlockedSubclassFeatures,
      pendingChoices,
    },
    message: `${character.name} subió a nivel ${nextLevel}.`,
  });
} catch (error) {
  console.error(
    "Error en POST /games/:gameId/characters/:characterId/level-up:",
    error
  );

  return res.status(500).json({
    message:
      error instanceof Error
        ? error.message
        : "Error interno al subir de nivel.",
  });
}


}
);

gamesRouter.get("/:gameId", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const gameId = String(req.params.gameId);

const membership = await getUserMembership(gameId, user.id);

if (!membership) {
  return res.status(404).json({
    message: "Partida no encontrada o no tienes acceso.",
  });
}

const game = await prisma.game.findUnique({
  where: {
    id: gameId,
  },
  include: {
    dm: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    members: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    },
  },
});

if (!game) {
  return res.status(404).json({
    message: "Partida no encontrada.",
  });
}

return res.json({
  game,
  role: membership.role,
});


} catch (error) {
console.error("Error en GET /games/:gameId:", error);


return res.status(500).json({
  message: "Error interno al cargar partida.",
});


}
});

gamesRouter.delete("/:gameId", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const gameId = String(req.params.gameId);

const membership = await getUserMembership(gameId, user.id);

if (!membership || membership.role !== "DM") {
  return res.status(403).json({
    message: "Solo el DM puede eliminar esta partida.",
  });
}

await prisma.game.delete({
  where: {
    id: gameId,
  },
});

return res.json({
  ok: true,
  message: "Partida eliminada.",
});


} catch (error) {
console.error("Error en DELETE /games/:gameId:", error);


return res.status(500).json({
  message: "Error interno al eliminar partida.",
});


}
});
