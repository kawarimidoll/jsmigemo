# jsmigemo

[![Build Status](https://travis-ci.org/oguna/jsmigemo.svg?branch=master)](https://travis-ci.org/oguna/jsmigemo)

JavaScriptでMigemoを利用するためのライブラリ

## HOW TO USE

### Browser

`jsmigemo.js` と `migemo-compact-dict` を本リポジトリから用意します。

jsmigemoを使うHTMLに次のタグを追加し、`jsmigemo.js` を読み込みます。

```html
<script type="text/javascript" src='jsmigemo.js'></script>
```

次に、scriptタグ内で、辞書ファイルをサーバから読み込みます。

```js
var cd;
var req = new XMLHttpRequest();
req.open("get", "migemo-compact-dict", true);
req.responseType = "arraybuffer";
req.onload = function () {
	var ab = req.response;
	cd = new jsmigemo.CompactDictionary(ab);
}
req.send(null);
```

読み込み完了後、migemoを初期化します。
setDictメソッドで、先に読み込んだ辞書ファイルを指定します。
queryメソッドで、検索したい単語をローマ字で引数に与えると、その単語にヒットする正規表現が返ります。

```js
var migemo = new jsmigemo.Migemo()
migemo.setDict(cd);
var rowregex = migemo.query(queryInputElement.value);
```

queryメソッドはステートレスのため、複数のスレッドから同時に呼び出すことができます。

## TODO
- 辞書ファイルの生成スクリプト
- 辞書ファイルを他の辞書（kuromoji-ipadic-neologdとか）から生成する
- 処理の高速化
- シングルJSファイルでの配布
- CLIアプリ化

## 辞書ファイルについて
本ライブラリに付属の辞書ファイルは、SKK辞書から生成されています。
そのため、辞書ファイル `migemo-compact-dict` のライセンスはSKK辞書から継承しています。
SKK辞書のライセンスについては、[SKK辞書配布ページ](http://openlab.ring.gr.jp/skk/wiki/wiki.cgi?page=SKK%BC%AD%BD%F1)をご覧ください。

## シングルJSファイルとして出力

```
node .\node_modules\webpack\bin\webpack.js
```