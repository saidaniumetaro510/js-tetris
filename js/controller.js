/*
 * 参考
 * http://coderecipe.jp/recipe/iHjJBJx9Si/
 */

document.body.onkeydown = function(e){
  // キーに名前をセットする
  var keys = {
    37:'left'
    ,39:'right'
    ,40:'down'
    ,38:'rotate'
  };

  if(typeof keys[e.keyCode] != 'undefined'){
    // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
    keyPress(keys[e.keyCode]);
    // 描画処理を行う
    render();
  }
};
