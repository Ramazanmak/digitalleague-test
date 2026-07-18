# Инструкция для запуска проекта

Эта инструкция поможет Вам установить и запустить у себя проект `digitalleague-test`. 

Уже собранный рабочий проект вы можете опробовать [здесь](https://ramazanmak.github.io/digitalleague-test/).

## Необходимые программы 
Для успешной работы проекта необходимо иметь установленным Node.js с менеджером пакетов NPM. 
Подробности установки можно изучить на [сайте](https://nodejs.org/en/download). 

## Запуск проекта

1. Склонируйте данный репозиторий на своё устройство:
```bash
git clone https://github.com/Ramazanmak/digitalleague-test.git
```
2. Перейдите в созданную папку:
```bash
cd digitalleague-test/
```
3. Установите зависимости:
```bash
npm install
```
4. Запустите `dev`-сервер:
```bash
npm run dev
```
5. Перейдите по указанной в терминале ссылке. Скорее всего это: `http://localhost:5173/digitalleague-test/`.


## Production-сборка
4. Запустите локальную сборку проекта:
```bash
npm run build
```
5. Запустите предпросмотр собранного проекта локально:
```bash
npm run preview
```
6. Перейдите по указанной в терминале ссылке. Скорее всего это: `http://localhost:4173/digitalleague-test/`.
