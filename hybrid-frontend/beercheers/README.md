# Expo Router Example

Use [`expo-router`](https://docs.expo.dev/router/introduction/) to build native navigation using files in the `app/` directory.

## 🚀 How to use

```sh
npx create-expo-app -e with-router
```

## 📝 Notes

- [Expo Router: Docs](https://docs.expo.dev/router/introduction/)


## Consideraciones para la aplicación

La aplicación se encuentra dentro de la carpeta beercheers que está dentro de hybrid-frontend. Para ejecutar la aplicación se debe estar dentro de la carpeta beercheers.

Una vez dentro de la carpeta beercheers, para ver el frontend ejecutar el comando: npm run start

Para iniciar el backend que se encuentra en la carpeta backend se debe ejecutar el comando: rails s -b 0.0.0.0 -p 3001

Se debe incluir un archivo .env dentro de la carpeta beercheers que contenga la variable: BACKEND_URL=http://{direccion_ip}:3001, reemplanzando {direccion_ip} por la dirección ip de tu computador y sin colocar las llaves {}, solo el número ip.