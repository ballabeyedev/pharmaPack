const checkPermission = (permissionKey) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.permissions) {
        return res.status(403).json({
          message: "Permissions non définies"
        });
      }

      // Extraire les clés si permissions = objets
      const userPermissions = user.permissions.map(p =>
        typeof p === "string" ? p : p.key
      );

      if (!userPermissions.includes(permissionKey)) {
        return res.status(403).json({
          message: "Accès refusé - permission requise: " + permissionKey
        });
      }

      next();

    } catch (error) {
      console.error("Erreur checkPermission :", error);
      return res.status(500).json({
        message: "Erreur serveur"
      });
    }
  };
};

module.exports = checkPermission;