/*
 * 参考
 * http://coderecipe.jp/recipe/iHjJBJx9Si/
 */

var COLS=10, ROWS=20; // 横10,縦20マス
var board=[]; // 盤面情報
var lose; // 一番上までいったかどうか
var interval; // ゲームを操作するタイマーを保持する変数
var current; // 今操作しているブロックの形
var currentX,currentY; // 今操作しているブロックの位置

// 操作するブロックのパターン
var shapes = [
  [1,1,1,1]
  ,[1,1,1,0,1]
  ,[1,1,1,0,0,0,1]
  ,[1,1,0,0,1,1]
  ,[1,1,0,0,0,1,1]
  ,[0,1,1,0,1,1]
  ,[0,1,0,0,1,1,1]
];

// ブロックの色
var colors = [
  'cyan','orange','blue','yellow','red','green','purple'
];

// 盤面をまっさらにする
// 0:何もない 1~ブロック を表す
// y,xは左上が0,0とする
function init(){
  for(var y=0; y<ROWS; ++y){
    board[y]=[];
    for(var x=0; x<COLS; ++x){
      board[y][x] = 0;
    }
  }
}

// 新しい操作ブロックをランダムでセットする
function newShape(){
  var id = Math.floor(Math.random() * shapes.length); // ランダムにインデックスを出す
  var shape = shapes[id];

  // パターンを操作ブロックへセットする
  current = [];
  for(var y=0; y<4; ++y){
    current[y] = [];
    for(var x=0; x<4;++x){
      var i=4*y+x;
      if(typeof shape[i] != 'undefined' && shape[i]){ // 1のときのみtrue
        current[y][x]=id+1;
      } else {
        current[y][x]=0;
      }
    }
  }
  // ブロックを盤面の上の方にセットする
  currentX = 5;
  currentY = 0;
}

// ゲームが始まると250msごとに呼び出されていく関数
function tick(){
  // 1つ下へ移動する
  if(valid(0,1)){
    ++currentY;
  }else{
    // もし着地していたら(1つ下にブロックがあったら)
    freeze();
    clearLines();
    if(lose){
      // ゲームオーバーなら最初から
      newGame();
      return false;
    }
    // 新しい操作ブロックをセットする
    newShape();
  }
}

// 現在の操作ブロックがその方向(offsetX,offsetY)に移動できるかどうかを判定するが、
// newCurrentという引数をとった場合、そのブロックがその方向に動いたらという判定をする
//   以下の場合にfalseを返す
//   # 移動先が盤面外の場合
//   # 移動先に既に色のマスがあった場合
//   もし操作ブロックが盤面の上にあったらゲームオーバーにする
function valid(offsetX,offsetY,newCurrent){
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  offsetX = currentX + offsetX;
  offsetY = currentY + offsetY;
  newCurrent = newCurrent || current;
  for(var y=0; y<4; ++y){
    for(var x=0; x<4; ++x){
      if(newCurrent[y][x]){
          if(typeof board[y+offsetY] == 'undefined'
            || typeof board[y+offsetY][x+offsetX] == 'undefined'
            || board[y+offsetY][x+offsetX]
            || x+offsetX < 0
            || y+offsetY >= ROWS
            || x+offsetX >= COLS) {
              if(offsetY == 1 && offsetX - currentX == 0 && offsetY - currentY == 1){
                console.log('GAME OVER...');
                lose = true; // 操作ブロックが盤面の上にあったらゲームオーバーにする
              }
              return false;
          }
      }
    }
  }
  return true;
}

// 操作ブロックを盤面にセットする関数
function freeze(){
  for(var y=0; y<4; ++y){
    for(var x=0; x<4; ++x){
      if(current[y][x]){
        board[y+currentY][x+currentX] = current[y][x];
      }
    }
  }
}

// 1行揃っているかを画面下から調べて、揃っていたらそれを消す
function clearLines(){
  for(var y=ROWS-1; y>=0; --y){
    var rowFilled = true;
    // 1行揃っているか調べる
    for (var x=0; x<COLS; ++x){
      if(board[y][x] == 0){
        rowFilled = false;
        break;
      }
    }

    // もし1行揃っていたらサウンドを鳴らしてから消す
    if(rowFilled){
      document.getElementById('clearsound').play();
      // その上にあったブロックを1つずつ落としていく
      for(var yy=y; yy>0; --yy){
        for(var x=0; x<COLS; ++x){
          board[yy][x] = board[yy-1][x];
        }
      }
      ++y; // 1行落としたのでチェック処理を1つ下へ送る
    }
  }
}

// キーボードが押されたときに呼び出される関数
function keyPress(key){
  switch(key){
    case 'left':
      if(valid(-1)){
        --currentX; // 左に1つずらす
      }
      break;
    case 'right':
      if(valid(1)){
        ++currentX; // 右に1つずらす
      }
      break;
    case 'down':
      if(valid(0,1)){
        ++currentY; // 下に1つずらす
      }
      break;
    case 'rotate':
    // 操作ブロックを回す
      var rotated = rotate(current);
      if(valid(0,0,rotated)){
        current = rotated; // 回せる場合は、回したあとの状態に操作ブロックをセットする
      }
      break;
  }
}

// 操作ブロックを回す処理
function rotate(current){
  var newCurrent = [];
  for(var y=0; y<4; ++y){
    newCurrent[y] = [];
    for(var x=0; x<4; ++x){
      newCurrent[y][x] = current[3-x][y];
    }
  }
  return newCurrent;
}

// 新しいゲームを始める
function newGame(){
  clearInterval(interval); // ゲームタイマーをクリア
  init(); // 盤面をまっさらにする
  newShape(); // 操作ブロックをセット
  lose = false; // 負けフラグ
  interval = setInterval(tick,250); // 250ms毎にtickという関数を呼び出す
}

newGame();
