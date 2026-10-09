# Flat Prism UI Practice — Design System

Version 1.0 / 2026-10-08

## 1. 目的

ミニマルな個人サイト・ポートフォリオ・一般的なWeb UIに適用できる、薄い透明感とプリズムの操作反応を持つデザイン仕様。

- 透明感は面の半透明と控えめなぼかしで表す。文字は透かさない。
- 影、厚み、方向性のある反射を使わず、フラットな画面を保つ。
- 大きい背景面に虹色を敷かない。虹色は操作、選択、短い見出しのアクセントに限定する。
- 色だけで意味を伝えず、ラベル・チェック・アイコンの塗り・位置・動きで補う。
- 書体・配色・テーマ・状態・アニメーションは共通トークンで管理する。

このキットはCSSと依存ライブラリのないJavaScript。サイト全体を作るフレームワークではなく、既存サイトへ段階的に導入するための部品。

## 2. 同梱ファイル

| ファイル | 用途 |
|---|---|
| `DESIGN.md` | この仕様、状態ルール、使い方、移行方法 |
| `prism-ui.css` | 本番用のスコープ付きトークン・文字・部品・状態・動き |
| `prism-ui.js` | 任意で使うボタン反応、選択、タブ、保存結果、文字の再生制御 |
| `preview.html` | ライト／ダーク、21状態の見本と動く保存デモのマークアップ |
| `preview.css` | 見本の配置と固定状態を表すスタイル。本番へは組み込まない |
| `preview.js` | 見本のテーマ切替、操作反応、模擬保存。本番へは組み込まない |

`preview.html`は同じフォルダの2つのCSSと2つのJSを相対パスで読み込む。フォルダごと保存すればネット接続やビルドなしで開ける。配布用の`prism-ui.css`と`prism-ui.js`が先、見本専用の`preview.css`と`preview.js`が後の順番にする。見本用JSは共通の操作反応に`PrismUI.accept()`と`PrismUI.shimmer()`を使う。見本のレイアウト・状態を固定するクラス・約1.7秒の模擬保存は見本専用。本番用JSの`run()`は模擬時間で成功させず、サイト側のPromiseが成功するまで待つ。

公開プレビューのCSSを更新したら、`preview.html`のCSSリンクに付けた`?v=`の値を変更する。Pages側で旧CSSがキャッシュされていても、新しい見本を取得できるようにするため。公開URLの版を変える場合は`index.html`と`README.md`のリンクも合わせる。

## 3. 導入

```html
<link rel="stylesheet" href="/styles/prism-ui.css">
<div class="prism-ui" data-theme="light" id="site-ui">
  <!-- サイトのUI -->
</div>
<script src="/scripts/prism-ui.js"></script>
<script>
  const ui = PrismUI.init(document.getElementById('site-ui'));
  // SPAで破棄する際は ui.destroy();
</script>
```

全セレクターは`.prism-ui`内に限定する。外側の既存サイトには影響しない。`data-theme="light"`が既定。ダークは`PrismUI.setTheme(root, 'dark')`または属性を変更する。

テーマ選択の保存、OSテーマへの追従はサイト側が担当する。OSに追従する場合は初期化前に`matchMedia('(prefers-color-scheme: dark)')`を読み、ユーザーが選んだテーマを優先する。設定を勝手に書き換えない。

テーマ切り替えは次の属性で初期化する。

```html
<div role="group" aria-label="テーマ">
  <button type="button" data-prism-theme="light" aria-pressed="true">Light</button>
  <button type="button" data-prism-theme="dark" aria-pressed="false">Dark</button>
</div>
```

この例のテーマ選択ボタンのレイアウトはサイト側で用意する。

### 既存プロジェクトへの導入

このキットは既存UIを一括で置き換えるための完成テーマではない。導入前に、現在の画面とスタイル定義を見て、適用する画面・部品・状態を決める。実装担当者やAIアシスタントは、既存のデザインを推測で上書きせず、判断が必要な箇所ごとに導入者へ確認する。

1. **現状を把握する。** 既存画面、デザイントークン、コンポーネント、ライト／ダークの扱い、ブレークポイント、操作状態を確認する。導入対象を「ボタンだけ」「入力欄まで」など部品単位で決める。
2. **衝突を一覧にする。** 次の表を使い、既存の意味や操作を変える箇所を挙げる。衝突がなければ既存のCSS変数やコンポーネント構造に合わせて小さく試す。
3. **衝突ごとにモックを見せる。** 現状と候補を同じ文言・同じ状態・同じ画面幅で並べる。必要なら「一部だけ採用」の案も用意する。静止画だけで判断しにくい動きは、触れるモックで見せる。
4. **選択を確認してから適用する。** 色、優先順位、操作、文言、動きの判断は導入者に委ねる。回答がない箇所は保留し、その箇所に依存しない作業を進める。採用した判断と理由を記録する。
5. **一部品ずつ統合する。** `.prism-ui`のスコープ、`--prism-*`トークン、既存の状態管理を確認し、必要なCSSとJSだけを組み込む。Reactなどで既に状態を管理している場合、同じ要素をキットのJSでも更新しない。
6. **状態とテーマで確認する。** 通常、ホバー、押下、キーボードフォーカス、選択、無効、処理中、成功、失敗を、ライト／ダークと狭い画面で比較する。採用したモックと実装結果に差があれば、その差を示して再確認する。

| 衝突しやすい箇所 | 導入者へ確認すること | 比較モックに含めるもの |
|---|---|---|
| ブランド色・虹色 | 既存のブランド色を残すか、プリズム色をどの操作に使うか | 既存色／提案色、ライト／ダーク |
| 主操作の強さ | 既存の主ボタンと反転ボタンのどちらを優先するか | 通常・ホバー・押下、同じ画面内の副操作 |
| 角丸・余白・ガラス感 | 既存の密度や形に合わせるか、キットの値を採用するか | カード、入力欄、狭い画面での並び |
| 選択・エラー・無効の表現 | 既存の意味を保ちつつ形やラベルをどう区別するか | 色を見分けにくい場合、フォーカスが重なった場合 |
| 動き | どの演出を残し、短くし、省くか | 操作直後、動きを減らす設定 |
| 文言・アイコン | 既存の用語と矢印・チェックなどの意味を合わせるか | 実際の画面文脈と読み上げ名 |

確認の伝え方の例：「現在の主ボタンAと、反転ボタンBを同じ画面に並べました。ライト／ダークで一番目立たせたい操作はどれですか。Aを維持、Bへ変更、色だけBを採用のどれが意図に近いですか」。判断が必要な項目をまとめて一度に決めず、モックで差が見える単位で質問する。

プレビューの架空の名前・カード・保存デモは、導入先の実データや業務処理にそのまま使わない。見た目を採用する場合も、文言、リンク先、成功／失敗条件を導入先に合わせる。

## 4. トークン

| トークン | 役割 | ライト | ダーク |
|---|---|---|---|
| `--prism-bg` | 基本背景 | `#f6f7f9` | `#14161a` |
| `--prism-ink` | 見出し・ラベル・本文 | `#1c2430` | `#edf0f5` |
| `--prism-muted` | 説明・補足 | `#465264` | `#b4bdca` |
| `--prism-line` | 通常境界 | `#c7ced8` | `#414957` |
| `--prism-border-colors` | ホバー／選択中の枠を巡る色帯の色順 | UI用プリズムの円周配色 | 明るいUI用プリズムの円周配色 |
| `--prism-border-width` | ホバー／選択中の枠の共通太さ | `1.5px` | `1.5px` |
| `--prism-surface` | 薄い透明面 | 白70% | 白5% |
| `--prism-hover` | ホバー／落ち着いた完了面 | `#eceff3` | `#2b3039` |
| `--prism-pressed` | 押下 | `#dfe4eb` | `#414956` |
| `--prism-placeholder` | 未入力時の例示文字 | `#657182` | `#9aa5b2` |
| `--prism-primary`／`--prism-primary-ink` | 主操作の反転した面と文字 | 濃い墨色／白 | 明るい白／濃い墨色 |
| `--prism-focus` | 操作先を示す単色線 | `#3b4658` | `#d5deef` |
| `--prism-error` | 入力・処理エラー | `#a32f42` | `#f29aac` |
| `--prism-success` | 必要な完了補助色 | `#28684e` | `#96d2ba` |

UI用の淡いプリズム、文字用の濃いプリズム、ローダー用の固定円周グラデーションは別のトークン。ライトテーマで淡いUI用配色を文字へ使わない。

ライトの基本背景に対して、本文色は約14.6:1、補足色は約7.4:1。明るく調整した文字グラデーションの各停止色は最低約3.6:1で、大きな見出し向け。これは指定背景との計算値であり、半透明面の背後に写真等を置いた場合の保証ではない。実際の背景、グラデーションの各位置、文字サイズを確認する。

例：配色の調整はスコープ内のトークンだけ変える。

```css
.my-portfolio.prism-ui {
  --prism-bg: #f8f9fb;
  --prism-fade: 450ms;
}
```

## 5. タイポグラフィ

システムフォントを基本に、日本語フォントへフォールバックする。通常400、見出し・ラベル500。日本語の字間は標準。見出しも極端に詰めない。

| 用途 | サイズ | 行間 |
|---|---|---|
| H1／ページ見出し | `clamp(1.75rem, 1.2rem + 2vw, 2.5rem)` | 1.4 |
| H2／セクション | `clamp(1.375rem, 1.05rem + 1.2vw, 1.875rem)` | 1.45 |
| H3／小見出し | `clamp(1.125rem, 1rem + .55vw, 1.375rem)` | 1.5 |
| H4／項目見出し | `clamp(1rem, .94rem + .25vw, 1.125rem)` | 1.6 |
| リード文 | `clamp(1.0625rem, 1rem + .3vw, 1.25rem)` | 1.75 |
| 本文／ボタン | `clamp(.875rem, .84rem + .15vw, 1rem)` | 1.6〜1.7 |
| 入力文字 | `1rem` | 1.5 |
| 補足 | `.8rem` | 1.7 |

`rem`でユーザーのブラウザ文字設定を尊重し、`vw`で画面幅にも追従する。小さい端末で読みづらくならず、大画面で過剰に拡大しないよう`clamp()`で範囲を持たせる。端末のOS文字設定がWebへ反映されるかはブラウザに依存する。ルートに小さい固定`font-size`を設定しない。

サイズとHTMLの意味は分けて考える。H1はページの主見出し、H2はその章、H3は下位の章。文字を大きくするだけの目的で見出し階層を飛ばさない。

短い導入には`prism-lead`を使う。本文内のリンクは`prism-link`で常に下線を示し、色だけに頼らずリンクだと分かるようにする。文字はテーマの通常色を保ち、矢印アイコンと下線だけをプリズム色にする。ホバーとキーボードフォーカスでは、その2か所の色が流れる。ライトテーマの矢印には小さい文字でも見える濃さの別グラデーションを使う。

```html
<p class="prism-lead">小さな操作にも、伝わる理由を。</p>
<p>制作の背景は<a class="prism-link" href="/works/">作品一覧<span data-prism-link-icon aria-hidden="true">↗</span></a>から確認できます。</p>
```

虹色の文字はページ冒頭の短いフレーズ1か所程度。本文、入力ラベル、操作ラベルに使わない。

```html
<h1>小さな体験を、<button type="button" class="prism-word"
  aria-label="丁寧に。プリズムの動きを再生">丁寧に。</button></h1>
```

表示位置に入ったときに約2.8秒で少し色が流れて止まる。タップ／Enter／Spaceでは約1.9秒の再生。色帯の位置を0%→94%→18%→88%→35%と往復させ、帯の幅も変えて色素の移動を強める。装飾であり、ページ遷移や状態選択を意味しない。

## 6. 状態の考え方

| 状態 | 意味 | 持続 |
|---|---|---|
| enabled | 操作できる | 操作可能な間 |
| hover | ポインターが乗っている | 乗っている間 |
| active／pressed | 指・キーで押している | 押している間 |
| focus | キーボード入力の受け取り先 | 入力先が変わるまで |
| selected／checked | 選択・ONという設定 | 解除されるまで |
| accepted | 操作を受け付けた | 短時間 |
| pending | 実際の処理が進行中 | Promiseが完了するまで |
| success／error | 実際の処理結果 | 次の操作まで／必要な間 |

CSSの`:active`は「選択中」ではない。選択ボタンは`aria-pressed`、タブは`aria-selected`、スイッチはcheckboxの`checked`で管理する。

優先順位は単純な一列にせず、表示する場所を分ける。

- 面：通常、ホバー、押下の単色変化と、操作受付の薄い虹色。
- 内枠：ホバー中と選択中に回転し続ける虹色。
- 外枠：キーボードフォーカスの単色。
- アイコン・文字：チェック、処理中、結果。
- 入力欄：通常フォーカスは1本の単色枠。エラー時だけ赤枠を保ち、フォーカスは離した単色外枠を追加。

選択中＋フォーカスの二重線は2つの意味を意図して表示する。通常入力欄の虹色＋標準アウトラインが偶然重なる状態は作らない。

## 7. ボタン

### 通常の操作

```html
<button type="button" class="prism-button" data-prism-action>
  見本を見る <span data-prism-icon aria-hidden="true">↗</span>
</button>
```

通常は単色の薄い面。ホバーで面を少し濃くし、枠線だけにプリズム色を表示して2.4秒周期で回転させ続ける。ポインターが外れたら止まる。ホバー中も文字と面は虹色にしない。押下は即時に濃くする。クリック受付後に450msで淡い虹色の背景・枠が現れ、約1.3秒後にフェードアウトする。アイコンだけ一時的に白くなる。

`data-prism-action`は受付反応のみ。保存・購入・送信の成功を意味しない。処理を持つ操作は次の`run()`を使い、同じボタンに受付属性を付けない。

### 主操作

```html
<button type="button" class="prism-button prism-button-primary" data-prism-action>
  見本を見る <span data-prism-icon aria-hidden="true">↗</span>
</button>
```

最も進んでほしい操作を示す反転ボタン。ライトでは濃い墨色の面に白文字、ダークでは明るい白の面に濃い文字にする。ホバーの虹色は枠線だけに使い、操作受付では短い反応にとどめる。主操作はひとつの領域に原則ひとつとし、配置・余白・動詞でも優先度を伝える。

### 選択・トグルボタン

```html
<button type="button" class="prism-button" data-prism-toggle aria-pressed="false">
  表示する <span data-prism-check aria-hidden="true">✓</span>
</button>
```

ONなら虹色の枠を回転させ続け、チェックも表示する。選択を解除してポインターも外れたら枠の回転を止める。ラベルはON/OFFで変更しない。チェック用スペースを残し、切り替えでボタン幅を変えない。アプリの設定更新には`prism:change`イベントを使う。

```js
root.addEventListener('prism:change', event => {
  console.log(event.target, event.detail.selected);
});
```

### 小さいアイコンボタン

```html
<button type="button" class="prism-button prism-button-icon"
  data-prism-toggle aria-pressed="false" aria-label="お気に入り">
  <span data-prism-icon aria-hidden="true">
    <span data-prism-icon-off>♡</span><span data-prism-icon-on>♥</span>
  </span>
</button>
```

ONでは薄い虹色の背景＋枠に加え、輪郭の`♡`を塗りの`♥`へ切り替える。`aria-pressed`の更新だけでCSSが表示を切り替えるため、色が分からなくても形で状態を判別できる。サイト固有のアイコンを使う場合は、同じ位置に輪郭／塗りのSVGを用意して切り替える。アクセシブルな名前は固定する。

最小操作領域は2.75rem四方を基本とする。アイコンを小さくしても操作領域まで小さくしない。

### テキストに近い操作

`prism-button prism-button-ghost`。通常は枠なし。ホバー中は他のボタンと同じく枠線だけでプリズム色が回転する。クリック後にそのボタン範囲だけ薄い虹色が現れる。カード全体は染めない。

### リンク

別ページへ移る操作は`<a href>`を使う。ボタン状の導線は`class="prism-button"`、本文内の導線は常時下線のある`class="prism-link"`を使う。文字は通常色のまま、`data-prism-link-icon`付きの矢印と下線を虹色にする。ホバー／フォーカスでは両方の色を約1.1秒動かす。リンク遷移をアニメーションのために遅らせない。すぐ移動する場合、演出が最後まで見えなくてもよい。

### 無効・処理中

`disabled`は通常の無効状態。理由が必要なら隣接する説明で伝える。`aria-disabled`だけではブラウザはクリックを止めないため、必ずハンドラーで防ぐ。キットは初期化済み領域のクリックを抑止するが、アプリの関数側にも多重実行防止を置く。

## 8. 非同期保存

```html
<button type="button" class="prism-button" id="save">保存する</button>
<p id="save-status" class="prism-small" role="status" aria-live="polite"></p>
```

```js
const button = document.getElementById('save');
const status = document.getElementById('save-status');
button.addEventListener('click', async () => {
  try {
    await PrismUI.run(button, async () => {
      const response = await fetch('/api/save', {method: 'POST'});
      if (!response.ok) throw new Error('save failed');
      return response.json();
    }, {statusElement: status, idleLabel: '保存する'});
  } catch (error) {
    // 必要ならログ記録。エラー表示はrun()が更新する。
  }
});
```

状態遷移：

1. 保存する → 保存中。文字と固定色相ローダーを表示し、`aria-busy="true"`と`aria-disabled="true"`。
2. Promise成功 → 保存しました。ボタン全体をやや強めの虹色にし、チェックも虹色にする。
3. 約1.4秒後 → 虹色が消えて無彩色へ。チェックと「保存しました」は残す。
4. Promise失敗 → エラー文を表示し、再操作可能へ。成功の虹色は出さない。

「灰色」は完了表示でも使うが、操作不可を意味させない。完了後の再保存を許可するか、編集まで待つかはサイト側で決める。このキットは演出終了後に再操作可能に戻す。

`run()`オプション：`pendingLabel`、`successLabel`、`errorLabel`、`retryLabel`、`idleLabel`、`completionDuration`、`statusElement`。`operation`は成功ならresolve、失敗ならrejectする。失敗を握りつぶしたPromiseを渡すと誤って成功扱いになる。

フォーム送信やReactでは、データの状態はアプリを正とする。DOMを直接操作する`run()`とReactの描画を同じ子要素へ同時に適用しない。状態に応じてCSSクラス・ARIA属性をReactから描画する方法を選ぶ。ルート破棄・画面遷移時のリクエストキャンセルもアプリ側で管理する。

## 9. 固定色相のローディング

```html
<span class="prism-spinner" aria-hidden="true"></span>
```

外形は`1.1em`、線幅`.15em`、光る区間55度、1周1.2秒。

| 時計方向の位置 | 固定色の目安 |
|---|---|
| 12時／0度 | 赤みのピンク |
| 2時／60度 | オレンジ・淡い金色 |
| 4時／120度 | グリーン |
| 6時／180度 | シアン |
| 8時／240度 | ブルー |
| 10時／300度 | 紫 |

色は円周上に固定した`conic-gradient`。動くのは55度の扇形マスクであり、円や背景グラデーションを回転させない。同じ角度を通ると常に同じ色になる。円周をなぞる短い光の区間が位置に応じて色を変える。

`@property --prism-loader-angle`で角度を型付き登録し、0→360度をアニメーションする。円形リングマスクと角度マスクを`mask-composite: intersect`で合成する。

調整例：

```css
.prism-ui {
  --prism-loader-size: 1.2em;
  --prism-loader-thickness: .17em;
  --prism-loader-arc: 65deg;
}
```

進捗率は表さない。不確定な待機表示。進捗が取得できる処理では別途プログレスバー等を使う。スクリーンリーダーには「保存中」の文字と`aria-busy`で状態を伝え、毎周読み上げない。

## 10. 入力・タブ・スイッチ・カード

### 入力

`prism-label`と`prism-input`を使う。labelの`for`とinputの`id`を対応させる。プレースホルダーは入力済みの値より一段薄い色にするが、判別できる濃さを保つ。入力済みは虹色にしない。`aria-invalid="true"`で赤い枠。エラー説明に`aria-describedby`で関連付ける。

`disabled`は落ち着いた面と破線枠で操作不可を示す。`readonly`は全面の枠を外した下線型にし、値を選択・コピーできる表示として区別する。両者を単なる薄い文字だけで表さない。エラー表示は適切な入力確認タイミングに出し、入力途中の各キーで警告を繰り返さない。

### タブ

```html
<div class="prism-tabs" role="tablist" aria-label="見本の種類">
  <button class="prism-tab" role="tab" type="button" id="tab-all"
    aria-controls="panel-all" aria-selected="true">すべて</button>
  <button class="prism-tab" role="tab" type="button" id="tab-ui"
    aria-controls="panel-ui" aria-selected="false" tabindex="-1">UI / UX</button>
</div>
<div role="tabpanel" id="panel-all" aria-labelledby="tab-all">すべての見本</div>
<div role="tabpanel" id="panel-ui" aria-labelledby="tab-ui" hidden>UIの見本</div>
```

選択中は移動する虹色の下線。左右キー、Home、Endで選択。Tabは選択中のタブへ入る。キットの自動選択は内容が即座に切り替わるローカルパネル向け。選択のたびに通信・遷移する用途では、Enterで確定する手動選択へ変更する。横書きLTR向け。IDはページ内で一意にし、各タブに独立したパネルを関連付ける。

### スイッチ

```html
<label for="notice">新しい見本のお知らせ</label>
<input type="checkbox" class="prism-switch" id="notice" checked>
```

虹色はONの背景側。白い丸は単色。つまみの位置は即座に移動し、色だけ450msで追従する。ラベルは状態によって書き換えない。

### カード

通常は`.prism-surface`で薄い面。コンテンツをすべてカードで囲まず、余白でも整理する。回転する虹色枠は本当に選択されたカードにだけ使う。「おすすめ」「代表作」の装飾へ選択と同じ枠を流用しない。

選択カードの枠はサイト側の状態に合わせて作る。プレビューのSELECTEDカードは見た目の説明用であり、カード選択機能は含まない。

## 11. 動きのルール

| 動き | 時間 | 原則 |
|---|---|---|
| 押下・フォーカス | 即時 | 操作先・受付を装飾より先に伝える |
| 虹色の出入り | 450ms | opacityでゆっくりなじませる |
| プリズムのきらめき | 1.2秒 | 一度だけ。常時ループしない |
| ボタンのホバー枠／選択中の枠 | 2.4秒周期 | ホバー中または選択中は色帯を回転させ続ける |
| タブのバー | 500ms | 同じバーが横へ移動する |
| ローダー | 1周1.2秒 | pendingの間だけループ |
| 保存完了の色 | 約1.4秒後に解除 | 完了文字とチェックは残す |
| 見出しの初回 | 2.8秒 | 見えたときに一度だけ |
| 見出しのタップ | 1.9秒 | 色帯を大きく往復させ、何度でも再生可能 |
| テキストリンクのホバー・フォーカス | 1.1秒 | 矢印と下線の色を動かす |

アイコンの白い反応は遊びの演出であり、状態を示す唯一の情報にしない。明るい面では一瞬輪郭が弱まるため、文字ラベルや選択状態の補助を残す。読みづらいアイコンでは演出を省略してよい。

`prefers-reduced-motion: reduce`では移動・回転・きらめきを止め、最終状態と文字だけで伝える。透明度軽減では面を不透明にし、ぼかしを外す。強制配色では虹色を単色の輪郭へ置き換える。

## 12. Tailwind・Next.jsへ移す

1. 既存の全スタイルを一度に置き換えず、`.prism-ui`の対象領域を決める。
2. `prism-ui.css`をグローバルCSSとして読み込む。
3. レイアウト・余白・グリッドはTailwindを継続し、部品の装飾は共通クラスへ移す。
4. 同じ部品へ`bg-*`、`text-*`、`border-*`、`ring-*`を重ねない。色はトークンで指定する。
5. `Button`、`IconButton`、`Input`、`Tabs`、`Switch`として共通コンポーネント化する。
6. `selected`、`pending`、`error`をReactの状態で保持し、ARIAとクラスを一緒に更新する。
7. `focus:outline-none`を無条件に使わず、代わりのフォーカス表示が残ることを確認する。

```jsx
<button
  type="button"
  className="prism-button"
  aria-pressed={selected}
  onClick={() => setSelected(v => !v)}
>
  表示する <span data-prism-check aria-hidden="true">✓</span>
</button>
```

React例では`data-prism-toggle`を付けない。ReactとキットのDOM制御の二重更新を避けるため。きらめきクラスはReact側で一時的に付け外しするか、`PrismUI.shimmer(ref.current)`だけ呼ぶ。

Next.jsではDOM初期化はクライアント側のeffectで行う。SSRのテーマは、サーバーで確定できるユーザー設定を優先し、初期表示後の明暗反転を抑える。キットはサーバー側で実行しない。

## 13. クラスとAPI索引

| クラス | 用途 |
|---|---|
| `.prism-ui` | 必須のスコープとトークン |
| `.prism-surface` | 薄い透明面 |
| `.prism-button` | 基本ボタン／リンク |
| `.prism-button-primary` | ライト／ダークで反転する主操作 |
| `.prism-button-icon` | 小さいアイコンボタン |
| `.prism-button-ghost` | 枠なしの低強調操作 |
| `.prism-input`／`.prism-label` | 入力とラベル |
| `.prism-switch` | native checkboxのスイッチ表示 |
| `.prism-tabs`／`.prism-tab`／`.prism-indicator` | タブと移動する下線 |
| `.prism-spinner` | 固定色相のローディング |
| `.prism-word` | 見出しのプリズム文字 |
| `.prism-lead`／`.prism-link` | 導入文／本文内リンク |
| `.prism-muted`／`.prism-small` | 補助文字 |
| `.prism-error`／`.prism-success` | 状態補助文字 |
| `.prism-flash`／`.prism-shimmer` | 一時的な受付・きらめき |
| `.prism-save-complete`／`.prism-save-done` | 完了直後／落ち着いた完了 |

`PrismUI.init(root)`：初期化・イベント設定。重複初期化は同じインスタンスを返す。

`PrismUI.setTheme(root, theme)`：light/dark。

`PrismUI.accept(element)`：操作受付の一時的な反応。

`PrismUI.shimmer(element)`：状態を変えずにきらめきだけ再生。

`PrismUI.run(button, operation, options)`：実処理に沿ったpending→success/error。

`instance.destroy()`：initによるイベント、監視、一時ボタン演出を解除。進行中の業務処理の中止はアプリ側が担当。

## 14. 適用時の確認

- ライトとダークの両方で、見出し・ラベル・補足・入力文字を読む。
- 反転した主操作と明るい虹色の見出しを、両テーマで読む。
- スマホ幅、横向き、大画面、ブラウザ200%拡大で折り返し・欠けを確認する。
- Tab移動、Enter、Space、タブの左右キーが使える。
- 選択済み＋フォーカス、エラー＋フォーカス、無効、処理中を確認する。
- 未入力、入力済み、無効、読み取り専用を文字の濃さだけに頼らず見分けられる。
- 連打しても非同期処理が二重に開始しない。
- 成功、失敗、再試行で正しいラベルへ移る。
- 動きを減らす設定でも結果を理解できる。
- 半透明面に写真等を置く場合は、その背景でも文字・線が見える。

キットは構文、参照、状態制御の検証を実施。実ブラウザの描画による検証は本環境では未実施。導入先の対象ブラウザで、特にCSSマスク・`@property`・既存スタイルとの競合を確認する。キット単体で全サイトのアクセシビリティ適合を保証しない。マスク合成未対応のエンジンでは、動かない単色リングへフォールバックする。型付きカスタムプロパティが未対応の場合も、装飾の滑らかな回転は保証せず、保存中の文字で状態を伝える。

## 15. 参照

- [W3C APG: Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [W3C APG: Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [W3C: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible/)
- [MDN: CSS mask-composite](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-composite)

W3Cの状態・フォーカスの区別を基礎に、色・時間・遊びの演出はこのデザインシステムでのデザイン判断として定義した。
