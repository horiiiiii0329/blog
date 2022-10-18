---
title: Node.jsとTypeScriptを使ってTwitterボットを作成した。
date: '2022-10-18'
tags: ['node', 'code']
draft: true
summary: Example of a markdown file with code blocks and syntax highlighting
image: /static/images/twitter-node.jpg
---

## はじめに

[twit](https://www.npmjs.com/package/twit)を使った特定のユーザーのツイートをリツイートできるアプリの作成になります。  
~~ある方（懸賞アカウント）に毎日毎日リツイートしてくれとめんどくさいので作成してみました~~

## 使用技術

- "@types/config": "^3.3.0",
- "@types/node": "^18.11.0",
- "@types/twit": "^2.2.31",
- "config": "^3.3.8",
- "inversify": "^6.0.1",
- "ts-node": "^10.9.1",
- "twit": "^2.2.11",
- "typescript": "^4.8.4"

## パッケージ解説

- config - configuration をいじれるようになります。これを使って Twitter の諸々のキーを保存?します。
- inversify - typescript のアノテーションを使い DI コンテナを実現してくれるやつ。
- twit - node.js 用の twitter api client になります。

## フォルダ構成

```
  📦twitterbot
 ┣ 📂config
 ┃ ┣ 📜custom-environment-variables.json
 ┃ ┣ 📜default.json
 ┃ ┣ 📜development.json
 ┃ ┗ 📜production.json
 ┣ 📂src
 ┃ ┣ 📂app
 ┃ ┃ ┣ 📂config
 ┃ ┃ ┃ ┗ 📜config-service.ts
 ┃ ┃ ┣ 📂dependency-injection
 ┃ ┃ ┃ ┗ 📜dependency-injection.ts
 ┃ ┃ ┣ 📂twitter
 ┃ ┃ ┃ ┗ 📜twitter-service.ts
 ┃ ┃ ┗ 📂twitter-bot
 ┃ ┃ ┃ ┗ 📜twitter-bot.ts
 ┃ ┗ 📜index.ts
 ┣ 📜.gitignore
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┗ 📜tsconfig.json
```

## 作り方

### 0．前提

TypeScript がわかるのあれば、ざっくりと雰囲気を掴んで頂けるかと思います。これをひな型にして機能をどんどんと追加していくのも面白いかと思います！

### 1. 諸々の設定とか

おすきなターミナルを開いて下記を実行していきます。

```console
mkdir twitter-bot
cd twitter-bot
npm init --yes
npm i config inversify twit ts-node typescript
npm i @types/config @types/node @types/twit
tsc init
code . //vscodeの起動
```

ルートテーブルに src というフォルダーを作り、その中に index.ts を作成します。
src に app というフォルダーを作ります。その後、tsconfig.json をいじります。

```json:tsconfig.json
{
	"exclude": ["./node_modules"],
	"compilerOptions": {
	"target": "es6"
	"lib": [
	"es6",
	"dom"
	]
	"module": "commonjs"  /* Specify what module code is generated. */,
	"rootDir": "./src"  /* Specify the root folder within your source files. */,
	"moduleResolution": "node"  /* Specify how TypeScript looks up a file from a given module specifier. */,
	"outDir": "./dist"  /* Specify an output folder for all emitted files. */,
	"esModuleInterop": true  /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. */,
	"forceConsistentCasingInFileNames": true  /* Ensure that casing is correct in imports. */,
	"strict": true  /* Enable all strict type-checking options. */,
	"skipLibCheck": true  /* Skip type checking all .d.ts files. */
	}
}
```

package.json をいじる。node と npm のバージョンはお使いの Ver に変えてください。

```json:package.json
{
  "name": "twitterbot",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "tsc": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rm -rf ./dist/ && npm run tsc --project",
    "start": "ts-node ./src/index.ts",
    "postinstall": "npm run tsc",
    "watch": "tsc -p tsconfig.json -w"
  },
  "engines": {
    "node": "16.8.0", //おつかいのNodeのVerに変えてください。
    "npm": "8.1.8" //おつかいのNpmのVerに変えて下さい。
  },
  "keywords": [],
  "author": "Yamada",
  "license": "ISC",
  "dependencies": {
    "config": "^3.3.6",
    "inversify": "^6.0.1",
    "reflect-metadata": "^0.1.13",
    "twit": "^2.2.11",
    "ts-node": "^10.4.0",
    "typescript": "^4.4.4",
    "@types/config": "^0.0.40",
    "@types/node": "^16.11.6",
    "@types/twit": "^2.2.30"
  }
}
```

config 周りを作成していきます。まずは config フォルダーをルートフォルダに作成します。
次に default.json, development.json, production.json, custom-environment-variables.json の計 4 つのファイルを作成します。custom-environment-variables.json 以外のファイルの中身を`{}`にしてください。
default.json の中身を下記のようにいじります。
こちらのファイルは config パッケージのお作法的なものになります。詳しくは[こちら](https://qiita.com/toshiyukihina/items/8180793bc40df3639cc6)にて詳しく紹介されているのでご参考頂ければと思います。

```js:default.json
{
 "Twit": {
	"consumerKey": "TWIT_CONSUMER_KEY",
	"consumerSecret": "TWIT_CONSUMER_SECRET",
	"accessToken": "TWIT_ACCESS_TOKEN",
	"accessTokenSecret": "TWIT_ACCESS_TOKEN_SECRET"
	}
}
```

### 2．実装

#### 2.1 config-service

src/app/に config フォルダーを作ります。その後、config-service.ts を作成します。
下記のコードをコピペします。

```js:config-service.ts
import "reflect-metadata";　// inversifyパッケージをつかうためのお作法的なもの
import { injectable } from 'inversify';
import config from 'config'; //configパッケージを使用する

export interface IConfigManager {
	TwitConsumerKey: string,
	TwitConsumerSecret: string,
	TwitAccessToken: string,
	TwitAccessTokenSecret: string
}

// inversifyのお作法で@inject()するためにSymbolを定義するお作法があるよう。
export const ConfigManagerLocator = {
	ConfigManager: Symbol.for('IConfigManager')
};

@injectable() //inversifyのデコレーター。
export class ConfigManager implements IConfigManager {
	public get TwitConsumerKey(): string {
		return config.get("Twit.consumerKey");
	}
	public get TwitConsumerSecret(): string {
		return config.get("Twit.consumerSecret");
	}
	public get TwitAccessToken(): string {
		return config.get("Twit.accessToken");
	}
	public get TwitAccessTokenSecret(): string {
		return config.get("Twit.accessTokenSecret");
	}
}
```

####2.2 twitter-service
src/app/フォルダー内に twitter フォルダーを作成し、twitter-service.ts を作成します。
下記のコードをコピペします。

```js:twitter-service.ts
import "reflect-metadata";
import { inject, injectable } from 'inversify';
import { ConfigManagerLocator, IConfigManager } from './../config/config-service';
import Twit from 'twit';　//https://www.npmjs.com/package/twit

export interface ITwitterService {
	WatchToFilterStream(params: Twit.Params | undefined): void;
}

export const TwitterServiceLocator = {
	TwitterService: Symbol.for('ITwitterService')
};

@injectable()
export class TwitterService implements ITwitterService {
	private readonly twit: Twit;

	// ここでAPIKEY等があるConfigManagerをinjectする。
	constructor(@inject(ConfigManagerLocator.ConfigManager) private configManager:IConfigManager) {
		this.twit = new Twit({
		consumer_key: configManager.TwitConsumerKey,
		consumer_secret: configManager.TwitConsumerSecret,
		access_token: configManager.TwitAccessToken,
		access_token_secret: configManager.TwitAccessTokenSecret
	});

}

public WatchToFilterStream(params: Twit.Params | undefined): void {
	// フィードを読み込み、paramsにわたされたユーザーIdをフィルターする。
	const stream = this.twit.stream('statuses/filter', params);
	stream.on('tweet', tweet => {
		// ある場合はリツイートする。
		this.twit.post('statuses/retweet/:id', {id: tweet.id_str});
	});
}
}
```

#### 2.3 twitter-bot-service

src/app/フォルダー内に twitter-bot フォルダーを作成し、twitter-bot.ts を作成します。
下記のコードをコピペします。

```js:twitter-bot.ts
import "reflect-metadata";
import { TwitterServiceLocator } from '../twitter/twitter-service';
import { inject, injectable } from "inversify";
import { ITwitterService } from "../twitter/twitter-service";

export interface ITwitterBot {
	retweetFilteredUser(...keywords: string[]):void
}

export const TwitterBotLocator = {
	TwitterBot: Symbol.for('ITwitterBot')
};

@injectable()
export class TwitterBot implements ITwitterBot {
	constructor(
	@inject(TwitterServiceLocator.TwitterService) private twitterService: ITwitterService) {}

	retweetFilteredUser(...keywords: string[]): void {
		this.twitterService.WatchToFilterStream({follow: keywords.join(',')});
	}
}
```

#### 2.4 dependency-injection-service

src/app/フォルダー内に dependency-injection フォルダーを作成し、dependency-injection.ts を作成します。
下記のコードをコピペします。

```js:dependency-injection.ts
import 'reflect-metadata'
import { TwitterBot, TwitterBotLocator } from './../twitter-bot/twitter-bot'
import {
  ITwitterService,
  TwitterService,
  TwitterServiceLocator,
} from './../twitter/twitter-service'
import { ConfigManager, ConfigManagerLocator, IConfigManager } from './../config/config-service'

import { Container } from 'inversify'

const container = new Container() //IoCコンテイナーの作成

//それぞれのinterfaceをimplにbindする。
container.bind <
  IConfigManager >
  ConfigManagerLocator.ConfigManager.to(ConfigManager).inSingletonScope()
container.bind <
  ITwitterService >
  TwitterServiceLocator.TwitterService.to(TwitterService).inSingletonScope()
container.bind < TwitterBot > TwitterBotLocator.TwitterBot.to(TwitterBot).inSingletonScope()

export default container
```

#### 2.5 index.ts

最初のほうに作った index.ts に下記のコードをコピーします。

```js:index.ts
import 'reflect-metadata'
import { ITwitterBot, TwitterBot, TwitterBotLocator } from './app/twitter-bot/twitter-bot'
import container from './app/dependency-injection/dependency-injection'

//containerをつかってインスタンスを作成。
const twitterBot = container.get < ITwitterBot > TwitterBotLocator.TwitterBot
//インスタンスの関数を呼び込む
twitterBot.retweetFilteredUser('elonmusk') //イーロンマスクさんのID
```

## 3 デプロイ

デプロイはお好きなものなんでも大丈夫です。環境変数を下記のように設定していただけるとすぐにためしていただくこともできるかと思います。  
twitter の API キーやコンシューマーキーの取り方は他記事がたくさんございますのでそちらを参考くださればと思います。

```js
NPM_CONFIG_PRODUCTION=true.
NODE_ENV="production".
TWIT_CONSUMER_KEY="your-consumer-key".
TWIT_CONSUMER_SECRET="your-consumer-secret".
TWIT_ACCESS_TOKEN="your-access-token".
TWIT_ACCESS_TOKEN_SECRET="your-access-token-secret".
```

以上、ありがとうございました。🔮🔮

参考記事: [# Learn to Build a Twitter Auto-Retweet Bot With Node.js and TypeScript](https://medium.com/@eng_ahmed.tarek/twitter-auto-retweet-bot-with-node-js-and-typescript-4d6eaf24c0ab)
