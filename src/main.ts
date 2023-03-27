import "./style.css";
import { UI } from "@peasy-lib/peasy-ui";
import { Assets } from "@peasy-lib/peasy-assets";
import { Input } from "@peasy-lib/peasy-input";
import { Chance } from "chance";

const chance = new Chance();

enum squareStates {
  unclicked = "unclicked",
  null = "null",
  showNumber = "shownumber",
  showX = "showX",
  showQ = "showQ",
  showE = "showE",
}

const model = {
  launch: (event: any, model: any) => {
    switch (model.level) {
      case "easy":
        model.minesweeper.appwidth = 400;
        model.minesweeper.numOfTargets = 10;
        break;
      case "med":
        model.minesweeper.appwidth = 400;
        model.minesweeper.numOfTargets = 15;
        break;
      case "hard":
        model.minesweeper.appwidth = 400;
        model.minesweeper.numOfTargets = 20;
        break;
    }
    model.minesweeper.numOfTries.forEach((t: any) => (t.status = false));
    model.minesweeper.isVisible = !model.minesweeper.isVisible;
    setTimeout(() => {
      model.minesweeper.onLoad(model);
    }, 375);
  },
  level: "easy",
  result: "waiting",
  minesweeper: {
    waitingOnReset: false,
    victoryStatus: "cancelled",
    get remainingToFind() {
      let num: number = this.countQuestionMarks();
      return this.numOfTargets - num;
    },
    countQuestionMarks: () => {
      let count = 0;
      model.minesweeper.squares.forEach((sq: any) => {
        if (sq.state == squareStates.showQ) count++;
      });
      return count;
    },
    squareclick: (event: any, model: any, element: HTMLElement, attribute: any, object: any) => {
      let localModal = object.$parent.$model;

      if (localModal.minesweeper.waitingOnReset) return;
      let gaurdClickStatus =
        model.square.state == squareStates.null ||
        model.square.state == squareStates.showX ||
        model.square.state == squareStates.showNumber;
      model.square.state == squareStates.showQ;
      model.square.state == squareStates.showE;
      if (gaurdClickStatus) return;
      switch (model.square.state) {
        case squareStates.unclicked:
          //3 scenarios
          // check showNum and status

          if (model.square.status) {
            model.square.state = squareStates.showX;

            if (localModal.minesweeper.attempts > 3) {
              localModal.minesweeper.numOfTries[2].status = true;
              localModal.minesweeper.victoryStatus = "UNSUCCESSFUL!";
              localModal.minesweeper.showFinalModal = true;
              setTimeout(() => {
                localModal.minesweeper.closeGame(null, localModal);
              }, 1500);
            } else {
              //redo attempt
              localModal.minesweeper.waitingOnReset = true;
              localModal.minesweeper.numOfTries[localModal.minesweeper.attempts - 1].status = true;
            }
            //increment 'tries'
            return;
          }
          if (model.square.numberValue == 0) {
            //run collapsing routine here
            model.square.state = squareStates.null;
            console.log("checking: ", model.square.$index);

            if (model.square.$index == 89) console.log(model.square);

            recursiveMineCheck(model.square.$index);
          } else {
            model.square.state = squareStates.showNumber;
            checkforVictory();
          }

          checkforVictory();
          break;
      }
    },
    sRightClick: (event: any, model: any, element: HTMLElement, attribute: any, object: any) => {
      let localModal = object.$parent.$model;
      if (localModal.minesweeper.waitingOnReset) return;
      let gaurdClickStatus =
        model.square.state == squareStates.null ||
        model.square.state == squareStates.showX ||
        model.square.state == squareStates.showNumber;
      if (gaurdClickStatus) return;
      switch (model.square.state) {
        case squareStates.showE:
          model.square.state = squareStates.unclicked;
          break;
        case squareStates.showQ:
          model.square.state = squareStates.unclicked;
          break;
        case squareStates.unclicked:
          model.square.state = squareStates.showQ;
          break;
      }
      checkforVictory();
    },
    closeGame: (event: any, model: any) => {
      console.log(model);

      model.minesweeper.isVisible = false;
      model.result = model.minesweeper.victoryStatus;
    },
    resetGame: (event: any, model: any) => {
      model.minesweeper.waitingOnReset = false;
      console.log(model.minesweeper.attempts);
      if (model.minesweeper.attempts > 3) return;
      model.minesweeper.numOfTries[model.minesweeper.attempts - 1].status = true;
      model.minesweeper.attempts++;
      model.minesweeper.onLoad(model);
    },
    showFinalModal: false,
    showHelp: (event: any, model: any) => {
      model.minesweeper.isHelpVisible = !model.minesweeper.isHelpVisible;
    },
    isHelpVisible: false,
    isVisible: false,
    appwidth: 500,
    numOfTargets: 5,
    attempts: 1,
    numOfTries: [
      {
        id: 0,
        status: false,
        get getframe() {
          if (this.status) return -20;
          else return 0;
        },
      },
      {
        id: 1,
        status: false,
        get getframe() {
          if (this.status) return -20;
          else return 0;
        },
      },
      {
        id: 2,
        status: false,
        get getframe() {
          if (this.status) return -20;
          else return 0;
        },
      },
    ],
    squares: <any>[],
    onLoad: (model: any) => {
      //defaults loaded

      model.minesweeper.squares.forEach((s: any) => {
        s.status = false;
        s.state = squareStates.unclicked;
      });

      //based on difficulty level, choose random square indexes for
      //let chosenSquares = chance.pickset(model.minesweeper.squares, model.minesweeper.numOfTargets);
      let chosenSquares = [42, 44, 73, 72, 67, 54, 55, 52, 85, 76];
      chosenSquares.forEach((index: any) => (model.minesweeper.squares[index].status = true));
      //chosenSquares.forEach((sq: any) => (sq.status = true));
    },
  },
};

for (let index = 0; index < 90; index++) {
  model.minesweeper.squares.push({
    status: false,
    get mark() {
      if (this.state == squareStates.unclicked) return "";
      else if (this.state == squareStates.null) return "";
      else if (this.state == squareStates.showE) return "!";
      else if (this.state == squareStates.showQ) return "?";
      else if (this.state == squareStates.showX) return "X";
      else if (this.state == squareStates.showNumber) return this.numberValue;
    },
    get bg() {
      if (this.state == squareStates.null) return "#002200";
      if (this.state == squareStates.showX) return "red";
      else return "#004400";
    },
    get color() {
      if (this.state == squareStates.showQ) return "white";
      else if (this.state == squareStates.showNumber) return "#03f106";
      else if (this.state == squareStates.showE) return "red";
    }, // '#03f106'
    state: squareStates.unclicked,
    get numberValue() {
      //catagorize cell
      let celltype;
      if (this.$index == 0) celltype = "topleft";
      else if (this.$index > 0 && this.$index <= 13) celltype = "top";
      else if (this.$index == 15 || this.$index == 30 || this.$index == 45 || this.$index == 60) celltype = "left";
      else if (this.$index == 29 || this.$index == 44 || this.$index == 59) celltype = "right";
      else if (this.$index == 14) celltype = "topright";
      else if (this.$index == 89) celltype = "bottomright";
      else if (this.$index == 75) celltype = "bottomleft";
      else if (this.$index > 75 && this.$index <= 88) celltype = "bottom";
      else celltype = "middle";

      let count = 0;
      let squaresToCheck: Array<number> = [];
      switch (celltype) {
        case "top":
          squaresToCheck.push(this.$index - 1, this.$index + 1, this.$index + 14, this.$index + 15, this.$index + 16);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "bottom":
          squaresToCheck.push(this.$index - 1, this.$index + 1, this.$index - 14, this.$index - 15, this.$index - 16);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "right":
          squaresToCheck.push(this.$index - 1, this.$index - 15, this.$index + 15, this.$index + 14, this.$index - 16);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "left":
          squaresToCheck.push(this.$index + 1, this.$index - 15, this.$index + 15, this.$index - 14, this.$index + 16);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "middle":
          squaresToCheck.push(
            this.$index - 1,
            this.$index + 1,
            this.$index - 15,
            this.$index + 15,
            this.$index + 14,
            this.$index - 14,
            this.$index - 16,
            this.$index + 16
          );
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "topleft":
          squaresToCheck.push(1, 15, 16);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "topright":
          squaresToCheck.push(13, 29, 28);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "bottomleft":
          squaresToCheck.push(60, 61, 76);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
        case "bottomright":
          squaresToCheck.push(88, 73, 74);
          squaresToCheck.forEach((s: number) => {
            if (checkSquare(s)) count++;
          });
          break;
      }

      return count;
    },
  });
}

const template = `<div> 
    <div class='controls'> 
        <button \${click@=>launch}> launch minigame</button>
        <select>
            <option \${'easy' ==> level}>Easy</option>
            <option \${'med' ==> level}>Medium</option>
            <option \${'hard' ==> level}>Hard</option>
        </select>
        <input class="result" type="text" readonly \${value<==result}></input>   
    </div>

    <div class="minigame" \${===minesweeper.isVisible} style="width:\${minesweeper.appwidth}px">
        <div style="width:100%;height:100%;position:relative;">
            <div style="width: 100%;height:10%; "><span class="game_title">CODE BREAKER</span></div>
            <div style="width: 100%;height:10%; "><span class="game_subtitle">\${minesweeper.numOfTargets} targets to decode!</span></div>
            <div class="pipFlex">
              <div class="pipButtons" \${click@=>minesweeper.closeGame}>Exit</div>
              <div class="pipButtons" \${click@=>minesweeper.resetGame}>Reset</div>
              <div class="pipButtons" \${click@=>minesweeper.showHelp}>Help</div>
            </div>
            <div class="countdown">
              Remaining
              <div>\${minesweeper.remainingToFind}</div>
            </div>
            <div class="lampflex">
                <div class="lamptitle">Number of attempts</div>
                <div class='lamp' \${lamp<=*minesweeper.numOfTries} style="background-position: \${lamp.getframe}px 0px;"></div>
            </div>
            <div class="gameborder">
                <div class="gamebox">
                    <div class="gamesquares" style="color: \${square.color}; background-color: \${square.bg};" \${square<=*minesweeper.squares} \${click@=>minesweeper.squareclick} \${contextmenu@=>minesweeper.sRightClick}><div>\${square.mark}</div></div>
                </div>
            </div>
        </div>  
        <div class="helpModal" \${===minesweeper.isHelpVisible}>
          <div class="helpText">
            <p>Instructions: Objective of game is to identify the hotspots through the process of elimination without clicking on them.</p>
            <p>Controls: left-click on a square to uncover it. right-click on square to flag it as hotspot</p>
            <p>GamePlay: if you uncover square with nothing around it, the null squares will collaps till you get close to hotspots</p>
            <p>The number of hotspots adjacent to a tile will be shown as a number in the square</p>
            <p>If you hit a hotspot, this attempt fails, and you need to click reset to try again, you get four tries</p>
          </div>
        </div>
        <div class="finalModal" \${===minesweeper.showFinalModal}>
          <div class="modalText">\${minesweeper.victoryStatus}</div>
        </div> 
    </div>

    

</div>`;

UI.create(document.body, template, model);

function checkSquare(index: number): boolean {
  let myStatus;
  if (index < 0 || index >= 90) return false;
  try {
    myStatus = model.minesweeper.squares[index].status;
  } catch (error) {
    window.alert(error);
    console.trace(index);
  }
  return myStatus;
}

function recursiveMineCheck(index: number) {
  const topRight = index % 15 != 14 && index - 14 >= 0 ? index - 14 : null;
  const top = index - 15 >= 0 ? index - 15 : null;
  const topLeft = index % 15 != 0 && index - 16 >= 0 ? index - 16 : null;
  const left = index % 15 != 0 ? index - 1 : null;
  const right = index % 15 != 14 ? index + 1 : null;
  const bottomLeft = index % 15 != 0 && index + 14 <= 89 ? index + 14 : null;
  const bottom = index + 15 <= 89 ? index + 15 : null;
  const bottomRight = index % 15 != 14 && index + 16 <= 89 ? index + 16 : null;

  if (index == 89) {
    console.log(topLeft, top, topRight);
    console.log(left, right);
    console.log(bottomLeft, bottom, bottomRight);
  }

  if (topLeft != null && topLeft! >= 0 && topLeft! <= 89) {
    console.log(model.minesweeper.squares[topLeft]);

    if (model.minesweeper.squares[topLeft].state == squareStates.unclicked) {
      if (model.minesweeper.squares[topLeft].numberValue == 0) {
        model.minesweeper.squares[topLeft].state = squareStates.null;
        console.log(`recursion: ${index} calling ${topLeft}`);

        recursiveMineCheck(topLeft);
      } else {
        model.minesweeper.squares[topLeft].state = squareStates.showNumber;
      }
    }
  }
  if (top != null && top! >= 0 && top! <= 89) {
    if (model.minesweeper.squares[top].state == squareStates.unclicked) {
      if (model.minesweeper.squares[top].numberValue == 0) {
        model.minesweeper.squares[top].state = squareStates.null;
        console.log(`recursion: ${index} calling ${top}`);
        recursiveMineCheck(top);
      } else {
        model.minesweeper.squares[top].state = squareStates.showNumber;
      }
    }
  }
  if (topRight != null && topRight! >= 0 && topRight! <= 89) {
    if (model.minesweeper.squares[topRight].state == squareStates.unclicked) {
      if (model.minesweeper.squares[topRight].numberValue == 0) {
        model.minesweeper.squares[topRight].state = squareStates.null;
        console.log(`recursion: ${index} calling ${topRight}`);
        recursiveMineCheck(topRight);
      } else {
        model.minesweeper.squares[topRight].state = squareStates.showNumber;
      }
    }
  }
  if (left != null && left! >= 0 && left! <= 89) {
    if (model.minesweeper.squares[left].state == squareStates.unclicked) {
      if (model.minesweeper.squares[left].numberValue == 0) {
        model.minesweeper.squares[left].state = squareStates.null;
        console.log(`recursion: ${index} calling ${left}`);
        recursiveMineCheck(left);
      } else {
        model.minesweeper.squares[left].state = squareStates.showNumber;
      }
    }
  }
  if (right != null && right! >= 0 && right! <= 89) {
    if (model.minesweeper.squares[right].state == squareStates.unclicked) {
      if (model.minesweeper.squares[right].numberValue == 0) {
        model.minesweeper.squares[right].state = squareStates.null;
        console.log(`recursion: ${index} calling ${right}`);
        recursiveMineCheck(right);
      } else {
        model.minesweeper.squares[right].state = squareStates.showNumber;
      }
    }
  }
  if (bottomLeft != null && bottomLeft! >= 0 && bottomLeft! <= 89) {
    if (model.minesweeper.squares[bottomLeft].state == squareStates.unclicked) {
      if (model.minesweeper.squares[bottomLeft].numberValue == 0) {
        model.minesweeper.squares[bottomLeft].state = squareStates.null;
        console.log(`recursion: ${index} calling ${bottomLeft}`);
        recursiveMineCheck(bottomLeft);
      } else {
        model.minesweeper.squares[bottomLeft].state = squareStates.showNumber;
      }
    }
  }
  if (bottom != null && bottom! >= 0 && bottom! <= 89) {
    if (model.minesweeper.squares[bottom].state == squareStates.unclicked) {
      if (model.minesweeper.squares[bottom].numberValue == 0) {
        model.minesweeper.squares[bottom].state = squareStates.null;
        console.log(`recursion: ${index} calling ${bottom}`);
        recursiveMineCheck(bottom);
      } else {
        model.minesweeper.squares[bottom].state = squareStates.showNumber;
      }
    }
  }
  if (bottomRight != null && bottomRight! >= 0 && bottomRight! <= 89) {
    if (model.minesweeper.squares[bottomRight].state == squareStates.unclicked) {
      if (model.minesweeper.squares[bottomRight].numberValue == 0) {
        model.minesweeper.squares[bottomRight].state = squareStates.null;
        console.log(`recursion: ${index} calling ${bottomRight}`);
        recursiveMineCheck(bottomRight);
      } else {
        model.minesweeper.squares[bottomRight].state = squareStates.showNumber;
      }
    }
  }
}

function checkforVictory() {
  //first check
  //are all cells addressed
  let rslt = model.minesweeper.squares.some((sq: any) => sq.state == squareStates.unclicked);
  //console.log("1st check: ", rslt);
  if (rslt) return;

  //are all the true cells labeled as showE
  rslt = model.minesweeper.squares.every((sq: any) => {
    if (sq.status == true) {
      return sq.state == squareStates.showQ;
    } else {
      return true;
    }
  });
  //console.log("2nd check: ", rslt);

  if (!rslt) {
    console.log(model.minesweeper.squares);
    return;
  }

  //Victory!!!
  model.minesweeper.victoryStatus = "VICTORY!!!";
  model.minesweeper.showFinalModal = true;
  setTimeout(() => {
    model.minesweeper.closeGame(null, model);
  }, 1500);
}
