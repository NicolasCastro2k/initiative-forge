import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getAuthUser } from "../lib/getAuthUser.js";

export const presetsRouter = Router();

presetsRouter.get("/presets/classes", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const classes = await prisma.classPreset.findMany({
  orderBy: {
    name: "asc",
  },
  include: {
    features: {
      orderBy: [
        {
          level: "asc",
        },
        {
          name: "asc",
        },
      ],
    },
    subclasses: {
      orderBy: {
        name: "asc",
      },
    },
  },
});

return res.json({
  classes,
});


} catch (error) {
console.error("Error en GET /presets/classes:", error);


return res.status(500).json({
  message: "Error interno al cargar clases.",
});


}
});

presetsRouter.get("/presets/classes/:classId", async (req, res) => {
try {
const user = getAuthUser(req);


if (!user) {
  return res.status(401).json({
    message: "Debes iniciar sesión.",
  });
}

const classId = String(req.params.classId);

const classPreset = await prisma.classPreset.findUnique({
  where: {
    id: classId,
  },
  include: {
    features: {
      orderBy: [
        {
          level: "asc",
        },
        {
          name: "asc",
        },
      ],
    },
    subclasses: {
      orderBy: {
        name: "asc",
      },
    },
  },
});

if (!classPreset) {
  return res.status(404).json({
    message: "Clase no encontrada.",
  });
}

return res.json({
  classPreset,
});


} catch (error) {
console.error("Error en GET /presets/classes/:classId:", error);


return res.status(500).json({
  message: "Error interno al cargar clase.",
});


}
});
