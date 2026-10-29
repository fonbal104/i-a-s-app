# i-a-s-app

IAS inc. bilingual React/Vite site based on the FPS Corp migration standard.

## Local development

```bash
npm install
npm run dev
```

To build the Plesk-ready static frontend:

```bash
npm run build
npm start
```

The contact endpoint is `POST /api/contact` and sends inquiries to `admin@i-a-s.biz`. Configure the SMTP credentials plus the reCAPTCHA v2 site and secret keys in `.env` locally or in Plesk environment variables. Do not commit secrets.
