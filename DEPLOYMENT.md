# Guide de déploiement - atlas.ludwig-emmanuel.dev

## 📋 Prérequis

1. **Serveur VPS/Cloud** avec:
   - Ubuntu 22.04 LTS (ou similaire)
   - 2GB RAM minimum (4GB recommandé)
   - 20GB disque
   - Docker & Docker Compose installés

2. **Domaine configuré**:
   - DNS A record: `atlas.ludwig-emmanuel.dev` → IP de votre serveur
   - DNS A record: `api.ludwig-emmanuel.dev` → IP de votre serveur (ou CNAME vers atlas)

3. **Ports ouverts**:
   - 80 (HTTP)
   - 443 (HTTPS)
   - 22 (SSH)

---

## 🚀 Déploiement rapide

### Étape 1: Connexion au serveur

```bash
ssh user@your-server-ip
```

### Étape 2: Installation Docker (si non installé)

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Étape 3: Cloner le projet

```bash
cd /opt
sudo git clone https://github.com/votre-repo/atlas-core.git
cd atlas-core
```

### Étape 4: Configuration environnement

```bash
# Copier et éditer les fichiers .env
cp .env.example .env
nano .env
```

Modifiez les valeurs:
```env
# Production settings
NODE_ENV=production
PORT=5000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=atlas_core_prod
DB_USER=atlas_admin
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE

# JWT
JWT_SECRET=VOTRE_SECRET_JWT_LONG_ET_COMPLEXE
JWT_REFRESH_SECRET=VOTRE_REFRESH_SECRET_LONG_ET_COMPLEXE

# Frontend
VITE_API_URL=https://api.ludwig-emmanuel.dev

# Domain
DOMAIN=atlas.ludwig-emmanuel.dev
API_DOMAIN=api.ludwig-emmanuel.dev
```

### Étape 5: Lancer avec Docker Compose

```bash
# Build et lancer
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose logs -f
```

### Étape 6: Configuration Nginx + SSL

```bash
# Installer Nginx et Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Créer config Nginx pour frontend
sudo nano /etc/nginx/sites-available/atlas
```

Contenu:
```nginx
server {
    listen 80;
    server_name atlas.ludwig-emmanuel.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.ludwig-emmanuel.dev;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir certificats SSL (Let's Encrypt)
sudo certbot --nginx -d atlas.ludwig-emmanuel.dev -d api.ludwig-emmanuel.dev
```

### Étape 7: Migrations de base de données

```bash
docker-compose exec backend npm run migrate
```

---

## 🔧 Alternative: Traefik (plus simple)

Utilisez `docker-compose.prod.yml` avec Traefik intégré (inclus dans le projet).

Traefik gère automatiquement:
- Reverse proxy
- Certificats SSL Let's Encrypt
- Load balancing
- Renouvellement auto des certificats

---

## 📦 Structure de déploiement

```
/opt/atlas-core/
├── docker-compose.prod.yml   # Config production
├── .env                       # Variables d'environnement
├── nginx/                     # Config Nginx custom
├── traefik/                   # Config Traefik
├── backend/
├── frontend/
└── postgres-data/             # Données persistantes DB
```

---

## 🔄 Mise à jour du code

```bash
cd /opt/atlas-core
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🛡️ Sécurité

1. **Firewall**:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Sauvegarde automatique DB**:
```bash
# Créer script de backup
sudo nano /opt/backup-atlas.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec atlas-postgres pg_dump -U atlas_admin atlas_core_prod > /opt/backups/atlas_$DATE.sql
# Garder seulement les 7 derniers backups
find /opt/backups/ -name "atlas_*.sql" -mtime +7 -delete
```

```bash
chmod +x /opt/backup-atlas.sh
# Ajouter au crontab (tous les jours à 3h)
crontab -e
0 3 * * * /opt/backup-atlas.sh
```

3. **Monitoring**:
- Installer Portainer pour gérer Docker: `docker run -d -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer-ce`

---

## 🌐 DNS Configuration

Sur votre gestionnaire DNS (Cloudflare, OVH, etc.):

```
Type    Name                          Value
A       atlas.ludwig-emmanuel.dev     VOTRE_IP_SERVEUR
A       api.ludwig-emmanuel.dev       VOTRE_IP_SERVEUR
```

Ou avec CNAME:
```
Type    Name                          Value
A       atlas                         VOTRE_IP_SERVEUR
CNAME   api                           atlas.ludwig-emmanuel.dev
```

---

## 📊 Monitoring & Logs

```bash
# Voir logs en temps réel
docker-compose logs -f

# Logs backend seulement
docker-compose logs -f backend

# Logs avec timestamp
docker-compose logs -f --timestamps

# Redémarrer un service
docker-compose restart backend

# Stats ressources
docker stats
```

---

## 🐛 Troubleshooting

### Frontend ne charge pas:
```bash
docker-compose logs frontend
# Vérifier VITE_API_URL dans .env
```

### Erreur 502 Bad Gateway:
```bash
# Vérifier que les containers sont up
docker-compose ps
# Redémarrer Nginx
sudo systemctl restart nginx
```

### Base de données inaccessible:
```bash
# Vérifier connexion DB
docker-compose exec backend npm run migrate
# Check logs postgres
docker-compose logs postgres
```

---

## ✅ Checklist finale

- [ ] DNS configuré et propagé (vérifier avec `nslookup atlas.ludwig-emmanuel.dev`)
- [ ] Docker containers running (`docker-compose ps`)
- [ ] SSL certificats installés (HTTPS fonctionne)
- [ ] Migrations DB exécutées
- [ ] Variables .env correctes
- [ ] Firewall configuré
- [ ] Backups automatiques configurés
- [ ] Accès https://atlas.ludwig-emmanuel.dev fonctionne
- [ ] Accès https://api.ludwig-emmanuel.dev/health fonctionne

---

## 🚀 Accès final

- **Frontend**: https://atlas.ludwig-emmanuel.dev
- **API**: https://api.ludwig-emmanuel.dev
- **Portainer** (si installé): https://atlas.ludwig-emmanuel.dev:9000

**Première connexion**: Créez un compte via le formulaire d'inscription!
