.PHONY: run install build

run: node_modules
	npm run dev

node_modules:
	npm install

install:
	npm install

build:
	npm run build
