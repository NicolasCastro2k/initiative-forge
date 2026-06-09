import { Router } from "express";
import { GameRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { getAuthUser } from "../lib/getAuthUser.js";

export const mapsRouter = Router();

type TileType = "floor" | "wall" | "pit";

type GridData = {
  tiles: TileType[][];
};

function createGrid(rows: number, cols: number): GridData {
  return {
    tiles: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "floor")
    ),
  };
}

function isTileType(value: unknown): value is TileType {
  return value === "floor" || value === "wall" || value === "pit";
}

function isValidGridData(
  value: unknown,
  rows: number,
  cols: number
): value is GridData {
  if (!value || typeof value !== "object") return false;

  const grid = value as { tiles?: unknown };

  if (!Array.isArray(grid.tiles)) return false;
  if (grid.tiles.length !== rows) return false;

  return grid.tiles.every((row: unknown) => {
    if (!Array.isArray(row)) return false;
    if (row.length !== cols) return false;

    return row.every((tile: unknown) => isTileType(tile));
  });
}

async function getMembership(gameId: string, userId: string) {
  return prisma.gameMember.findUnique({
    where: {
      gameId_userId: {
        gameId,
        userId,
      },
    },
  });
}

async function requireDm(gameId: string, userId: string) {
  const membership = await getMembership(gameId, userId);

  if (!membership || membership.role !== GameRole.DM) {
    return null;
  }

  return membership;
}

mapsRouter.get("/games/:gameId/maps", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const gameId = String(req.params.gameId);
    const membership = await getMembership(gameId, user.id);

    if (!membership) {
      return res.status(404).json({
        message: "Partida no encontrada o no tienes acceso.",
      });
    }

    const maps = await prisma.battleMap.findMany({
      where: {
        gameId,
        ...(membership.role === GameRole.DM ? {} : { isActive: true }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        gameId: true,
        name: true,
        rows: true,
        cols: true,
        isPublished: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      maps,
    });
  } catch (error) {
    console.error("Error en GET /games/:gameId/maps:", error);

    return res.status(500).json({
      message: "Error interno al cargar mapas.",
    });
  }
});

mapsRouter.post("/games/:gameId/maps", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const gameId = String(req.params.gameId);
    const membership = await requireDm(gameId, user.id);

    if (!membership) {
      return res.status(403).json({
        message: "Solo el DM puede crear mapas.",
      });
    }

    const name = String(req.body.name ?? "").trim();
    const rows = Number(req.body.rows ?? 0);
    const cols = Number(req.body.cols ?? 0);

    if (!name) {
      return res.status(400).json({
        message: "El nombre del mapa es obligatorio.",
      });
    }

    if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
      return res.status(400).json({
        message: "Filas y columnas deben ser números enteros.",
      });
    }

    if (rows < 3 || rows > 50 || cols < 3 || cols > 50) {
      return res.status(400).json({
        message: "El mapa debe tener entre 3 y 50 filas/columnas.",
      });
    }

    const map = await prisma.battleMap.create({
      data: {
        gameId,
        name,
        rows,
        cols,
        gridData: createGrid(rows, cols),
        isPublished: false,
        isActive: false,
      },
    });

    return res.status(201).json({
      map,
    });
  } catch (error) {
    console.error("Error en POST /games/:gameId/maps:", error);

    return res.status(500).json({
      message: "Error interno al crear mapa.",
    });
  }
});

mapsRouter.get("/maps/:mapId", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const mapId = String(req.params.mapId);

    const map = await prisma.battleMap.findUnique({
      where: {
        id: mapId,
      },
      include: {
        game: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!map) {
      return res.status(404).json({
        message: "Mapa no encontrado.",
      });
    }

    const membership = map.game.members.find(
      (member) => member.userId === user.id
    );

    if (!membership) {
      return res.status(403).json({
        message: "No tienes acceso a este mapa.",
      });
    }

    if (membership.role !== GameRole.DM && !map.isActive) {
      return res.status(403).json({
        message: "Este mapa no está activo para los jugadores.",
      });
    }

    return res.json({
      map: {
        id: map.id,
        gameId: map.gameId,
        name: map.name,
        rows: map.rows,
        cols: map.cols,
        gridData: map.gridData,
        isPublished: map.isPublished,
        isActive: map.isActive,
        role: membership.role,
        createdAt: map.createdAt,
        updatedAt: map.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error en GET /maps/:mapId:", error);

    return res.status(500).json({
      message: "Error interno al cargar mapa.",
    });
  }
});

mapsRouter.put("/maps/:mapId", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const mapId = String(req.params.mapId);

    const existingMap = await prisma.battleMap.findUnique({
      where: {
        id: mapId,
      },
      include: {
        game: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!existingMap) {
      return res.status(404).json({
        message: "Mapa no encontrado.",
      });
    }

    const membership = existingMap.game.members.find(
      (member) => member.userId === user.id
    );

    if (!membership || membership.role !== GameRole.DM) {
      return res.status(403).json({
        message: "Solo el DM puede editar este mapa.",
      });
    }

    const name = String(req.body.name ?? existingMap.name).trim();
    const gridData = req.body.gridData;

    if (!name) {
      return res.status(400).json({
        message: "El nombre del mapa es obligatorio.",
      });
    }

    if (!isValidGridData(gridData, existingMap.rows, existingMap.cols)) {
      return res.status(400).json({
        message: "El grid del mapa no es válido.",
      });
    }

    const map = await prisma.battleMap.update({
      where: {
        id: mapId,
      },
      data: {
        name,
        gridData,
      },
    });

    return res.json({
      map,
    });
  } catch (error) {
    console.error("Error en PUT /maps/:mapId:", error);

    return res.status(500).json({
      message: "Error interno al guardar mapa.",
    });
  }
});

mapsRouter.post("/maps/:mapId/activate", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const mapId = String(req.params.mapId);

    const existingMap = await prisma.battleMap.findUnique({
      where: {
        id: mapId,
      },
      include: {
        game: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!existingMap) {
      return res.status(404).json({
        message: "Mapa no encontrado.",
      });
    }

    const membership = existingMap.game.members.find(
      (member) => member.userId === user.id
    );

    if (!membership || membership.role !== GameRole.DM) {
      return res.status(403).json({
        message: "Solo el DM puede activar mapas.",
      });
    }

    await prisma.$transaction([
      prisma.battleMap.updateMany({
        where: {
          gameId: existingMap.gameId,
        },
        data: {
          isActive: false,
          isPublished: false,
        },
      }),
      prisma.battleMap.update({
        where: {
          id: existingMap.id,
        },
        data: {
          isActive: true,
          isPublished: true,
        },
      }),
    ]);

    const map = await prisma.battleMap.findUnique({
      where: {
        id: existingMap.id,
      },
    });

    return res.json({
      map,
    });
  } catch (error) {
    console.error("Error en POST /maps/:mapId/activate:", error);

    return res.status(500).json({
      message: "Error interno al activar mapa.",
    });
  }
});

mapsRouter.post("/games/:gameId/maps/hide-all", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const gameId = String(req.params.gameId);
    const membership = await requireDm(gameId, user.id);

    if (!membership) {
      return res.status(403).json({
        message: "Solo el DM puede ocultar mapas.",
      });
    }

    await prisma.battleMap.updateMany({
      where: {
        gameId,
      },
      data: {
        isActive: false,
        isPublished: false,
      },
    });

    return res.json({
      ok: true,
      message: "Todos los mapas fueron ocultados.",
    });
  } catch (error) {
    console.error("Error en POST /games/:gameId/maps/hide-all:", error);

    return res.status(500).json({
      message: "Error interno al ocultar mapas.",
    });
  }
});

mapsRouter.delete("/maps/:mapId", async (req, res) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Debes iniciar sesión.",
      });
    }

    const mapId = String(req.params.mapId);

    const existingMap = await prisma.battleMap.findUnique({
      where: {
        id: mapId,
      },
      include: {
        game: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!existingMap) {
      return res.status(404).json({
        message: "Mapa no encontrado.",
      });
    }

    const membership = existingMap.game.members.find(
      (member) => member.userId === user.id
    );

    if (!membership || membership.role !== GameRole.DM) {
      return res.status(403).json({
        message: "Solo el DM puede eliminar este mapa.",
      });
    }

    await prisma.battleMap.delete({
      where: {
        id: mapId,
      },
    });

    return res.json({
      ok: true,
      message: "Mapa eliminado.",
    });
  } catch (error) {
    console.error("Error en DELETE /maps/:mapId:", error);

    return res.status(500).json({
      message: "Error interno al eliminar mapa.",
    });
  }
});