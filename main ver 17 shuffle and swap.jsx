import {COLORS, GRID_POS, HAND_GRID, GRIDS, DECK_ONE, DECK_TWO, TEST_KEYS} from 'https://assets.codepen.io/4668860/initConstants.js';
// These are constants for various functions throughout the app

import {CuibcCard} from 'https://assets.codepen.io/4668860/card-class.js';
// Card needs a ("card name", Number(cell in grid), Element(grid its being placed into), [value array]) 
// for its constructor, when being used for cubic.

'use strict';
  
customElements.define('grid-card', Card, { extends: "div" });
  
class Main extends React.Component{
    constructor(props){
      super(props);
      this.state = {
          game: "Cubic",
          currPlayer: "1",
          pOneScore: "0",
          pTwoScore: "0",
          deckNum: 10,
          turn: "",
          full: false,
          dealt: false
      }
      this.deck = DECK_ONE;
      this.deckList = [...Object.keys(DECK_ONE)].concat([...Object.keys(DECK_ONE)]);

      this.cubicStart = this.cubicStart.bind(this);
      this.cardBattle = this.cardBattle.bind(this);
      this.startButton = this.startButton.bind(this);
      this.cardMouseDown = this.cardMouseDown.bind(this);
      this.cardMouseUp = this.cardMouseUp.bind(this);
      this.cardMoving = this.cardMoving.bind(this);
    }

    cardBattle(placedCard, cardList, chn = false, adv = true){

        function battle(attacker, defender, index){
            //perform the comparison
            let compare = [index, (3-index)];
    
            if(attacker.values[compare[0]] > defender.values[compare[1]])
                return "win";
            return "tie or loss";
        }
        function sumCheck(placedCard, adjacentCards){
            let sumList = adjacentCards.map((adjCard,index)=>{
                if(adjCard !=="none")
                    return placedCard.values[index]+adjCard.values[3-index];
                return "none";
            });
            //get all unique sums
            let validSums = [];
            sumList.forEach((x)=> {if(!validSums.includes(x)) validSums.push(x);})
            //check for count of each sum and flip as needed
            validSums.forEach((sumInQuestion)=>{
                //check if current sum has more than 1
                if(sumList.reduce((x,y)=>{return y===sumInQuestion?x+1:x;},0) > 1){
                    //if yes, run through and flip cards of that sum
                    sumList.forEach((x,y)=>{
                        if(x!=="none" && x===sumInQuestion &&
                          adjacentCards[y].player!==placedCard.player){
                            flipCard(adjacentCards[y], "SUM!", chain?"chain":false);
                        }
                    });
                }
            });

        }

        function matchCheck(placedCard, adjacentCards){
            let matchList = adjacentCards.map((adjCard,index)=>{
                if(adjCard === "none") return "none"; //catching this avoids errors on undefined values
                if(placedCard.values[index] === adjCard.values[3-index])
                    return placedCard.values[index];
                return "none";
            })
            if(matchList.reduce((x,y)=>{if(y!=="none") return x+1; return x;},0)>1){
                matchList.forEach((x,y)=>{
                    if(x!=="none")
                    adjacentCards[y].player===placedCard.player?"":flipCard(adjacentCards[y], "MATCH", chain?"chain":false);
                });
            }

        }

        function flipCard(adjCard, popupMsg = false, execChain = false){
            adjCard.player = (adjCard.player==="red")?"blue":"red";
            setTimeout(()=>{
                adjCard.style.backgroundColor = adjCard.style.backgroundColor === "red"? "blue":"red";
                
                if(document.querySelector("#sound-check").checked){
                    document.querySelector(flipSound).currentTime = 0;
                    document.querySelector(flipSound).play();
                }
                
                if (popupMsg) popup(popupMsg, adjCard);
                if (execChain) cardBattle(adjCard, cardList, "CHAIN", false);
              },500);
        }
        function popup(text, flippedCard){
            let newThing = document.createElement("p");
            newThing.appendChild(document.createTextNode(text));
            newThing.className = "popup-text";
            flippedCard.appendChild(newThing);
            setTimeout(()=>{
                flippedCard.querySelector(".popup-text").classList.add("fade-in");
                if(document.querySelector("#sound-check").checked){
                    document.querySelector("#tone").currentTime = 0;
                    document.querySelector("#tone").play();
                }
            },50);
            setTimeout(()=>{flippedCard.querySelector(".popup-text").classList.add("fade-out")},350);
            setTimeout(()=>{flippedCard.removeChild(flippedCard.querySelector(".popup-text"))},600);
            
        }

        let tempGrid = [[0, 1, 2],
                        [3, 4, 5],
                        [6, 7, 8]];
        let currentLoc = [tempGrid.findIndex((x)=>x.includes(placedCard.currentCell)),
                          tempGrid[tempGrid.findIndex((x)=>x.includes(placedCard.currentCell))].indexOf(placedCard.currentCell)];
    
        let adjacentCards = [];
        let result; //result of the battle
        let flipSound = (Math.floor(Math.random() * 2) === 0)?"#card-up-one":"#card-up-two";
        let sum = document.querySelector("#sum-check").checked,
            match = document.querySelector("#match-check").checked,
            chain = document.querySelector("#chain-check").checked;
        let cardBattle = this.cardBattle;
        
        //fill the adjacent card list, with "none" in case of no valid card
        for(let i = 0; i<4; i++){
            try{
                if(i === 1)
                    adjacentCards.push(cardList[cardList.findIndex((x)=>x.currentCell===tempGrid[currentLoc[0]][currentLoc[1]-1])]);
                if(i === 2)
                    adjacentCards.push(cardList[cardList.findIndex((x)=>x.currentCell===tempGrid[currentLoc[0]][currentLoc[1]+1])]);
                if(i === 0)
                    adjacentCards.push(cardList[cardList.findIndex((x)=>x.currentCell===tempGrid[currentLoc[0]-1][currentLoc[1]])]);
                if(i === 3)
                    adjacentCards.push(cardList[cardList.findIndex((x)=>x.currentCell===tempGrid[currentLoc[0]+1][currentLoc[1]])]);
            }
            catch{
                adjacentCards.push("none");
            }
        }
    
        //make all entries in adjacent cards valid
        adjacentCards = adjacentCards.map((x)=>{
            if(x === undefined || x === "none")
                return "none";
            else
                return x;
        });
        
        //check for advanced rules before performing normal rules
        if(adv && adjacentCards.reduce((x,y)=>{if(y!=="none") return x+1; return x;},0)>1){
            if(sum) sumCheck(placedCard, adjacentCards);
            if(match) matchCheck(placedCard, adjacentCards);
        }

        //if no adjacent enemy cards, do nothing
        if(adjacentCards.every((x)=>x==="none"))
            return "";
        else{
            adjacentCards.forEach((adjCard,index)=>{
                if (adjCard !== "none" && placedCard.player !== adjCard.player){
                    result = battle(placedCard, adjCard, index);
                    if (result === "win"){
                      flipCard(adjCard, chn?"CHAIN":false, false);
                    }
                }
            });
        }   
    }
    
    cardMouseUp(event){
            let theCard = event.currentTarget;
            let theBoard = document.querySelector("#main-box");
            let conflictingCard, cardList = [];
            
            //check again if card is on the board, to prevent accidental movement
            if(theCard.parentElement !== document.querySelector("#main-box")){
                let pointerX = event.clientX-10;
                let pointerY = event.clientY-10;
                theCard.onpointermove = null;
                theCard.onmouseup = null;
                theCard.releasePointerCapture(event.pointerId);
                theCard.classList.remove("grabbing");
                theCard.style.opacity = 1;
                let validMove = true;
                let index;    
                
                //Check if over the board
                if((pointerX >= theBoard.offsetLeft) && (pointerX <= theBoard.offsetLeft+theBoard.scrollWidth) &&
                (pointerY >= theBoard.offsetTop) && (pointerY <= theBoard.offsetTop+theBoard.scrollHeight)){
    
                    //find closest grid spot
                    index = this.findClosestCell(event);
    
                    document.querySelector("#main-box").querySelectorAll(".card").forEach((x)=>{
                        if(x !== theCard)
                            cardList.push(x);
                    });
                
                    for(let each of cardList){
                        if(each.currentCell === index){
                            validMove = false;
                            conflictingCard = each;
                        }
                    }
                }else validMove = false;
    
                //if not over a valid cell, revert to hand
                if(validMove === false){
                    theCard.style.left = (HAND_GRID[theCard.currentCell][0]-45)+"px"; //rework to go to top available slot?
                    theCard.style.top = (HAND_GRID[theCard.currentCell][1]-45)+"px";  //rework to go to top available slot?
                    theCard.style.backgroundColor = (theCard.style.backgroundColor==="blue")?"blue":"red";
                    theCard.style.border = `1px solid black`;
                    theCard.style.zIndex = theCard.currentCell;
                    if(conflictingCard)
                        conflictingCard.style.border = `1px solid black`;                
                //otherwise move the card, appending it to the board as necessary
                }else{
                    if (theCard.parentElement !== theBoard)
                        theBoard.appendChild(theCard.parentElement.removeChild(theCard));
                    theCard.style.left = `${GRID_POS[index][0]-45}px`;
                    theCard.style.top = `${GRID_POS[index][1]-45}px`;
                    theCard.style.zIndex = 1;
                    theCard.currentCell = index;
                    theCard.style.backgroundColor = (theCard.style.backgroundColor==="blue")?"blue":"red";
                    if(document.querySelector("#sound-check").checked){
                        document.querySelector("#card-down-one").currentTime = 0;
                        document.querySelector("#card-down-one").play();
                    }
    
                    //perform card battle if adjacent to any enemy cards
                    this.cardBattle(theCard, cardList);
                    
                    //check if board is full
                    if(document.querySelectorAll("#main-box > .card").length === 9){
                        //if so wait for any last flips, count number of cards of each color
                        setTimeout(()=>{
                            let blueCards = 0, redCards = 0;
                            document.querySelectorAll("#main-box > .card").forEach(x => {
                                if(x.player === "blue")
                                    blueCards++;
                            });
                            redCards = 9-blueCards;
                            if(redCards > blueCards){
                                this.setState({
                                    turn: "Red wins!"
                                });
                            }
                            else{
                                this.setState({
                                    turn: "Blue wins!"
                                });
                            }
                        }, 650);
                    }
                    //otherwise, set the next turn state
                    else{
                        setTimeout(()=>{
                            this.setState({
                                turn: (this.state.turn==="red")?"blue":"red"
                            });
                        }, 500);
                    }
    
                }
            }
    }
    
    cardMouseDown(event){
            let theCard = event.currentTarget;
            let players = {blue: COLORS.cardBlue, red: COLORS.cardRed};

            //first check if it's even your card
            if(theCard.parentElement !== document.querySelector("#main-box") && theCard.player === this.state.turn){
                //theCard.offsetX = theCard.parentElement.offsetLeft + Window.scrollX;
                //theCard.offsetY = theCard.parentElement.offsetTop + Window.scrollY;
                theCard.onpointerup = this.cardMouseUp;
                theCard.onpointermove = this.cardMoving;
                theCard.setPointerCapture(event.pointerId);
                theCard.classList.add("grabbing");
                theCard.style.opacity = 0.7;
                theCard.style.zIndex = 10;
            
            }
    }
    
    cardMoving(event){
        event.preventDefault();
        let theCard = event.currentTarget;
        theCard.style.left = `${event.clientX-theCard.offsetX-60}px`;  
        theCard.style.top = `${event.clientY-theCard.offsetY-60}px`;
        
        //find cell the card is over
        let index = this.findClosestCell(event);
        
        //check if occupied
        let cardList = [];
        document.querySelector("#main-box").querySelectorAll(".card").forEach((x)=>{
            if(x !== theCard)
                cardList.push(x);
        });
        
        let occupied = false;
    
        for(let i=0;i<cardList.length;i++){
          
          //highlight both cards if occupied
          if(cardList[i].currentCell === index){
            theCard.style.border = `3px solid ${COLORS.cardWarning}`;
            cardList[i].style.border = `3px solid ${COLORS.cardWarning}`;
            occupied = true;
          }
          //reset border when not occupied
          else{
            if(occupied === false)
              theCard.style.border = `1px solid black`;''
              cardList[i].style.border = `1px solid black`;
          }
        }
    }

    cardHoverPreview(event){
        let theCard = event.currentTarget;

        theCard.onpointerleave = (event)=>{
            theCard.onpointerleave = null;
            theCard.querySelector(".number-box").style.zIndex = theCard.currentCell;
        }
        theCard.querySelector(".number-box").style.zIndex = 10;
    }// needs re-work and implementation later?
    
    findClosestCell(event){
        let theBoard = document.querySelector("#main-box");
        let newArr = GRID_POS.map((x)=>{
          return Math.abs((event.clientX-theBoard.offsetLeft-10)-x[0]) + 
                 Math.abs((event.clientY-theBoard.offsetTop-10)-x[1])
        });
        return newArr.indexOf(Math.min(...newArr));
    }
    
    cubicStart() {
    }

    startButton(){
      let deckList = [...Object.keys(DECK_ONE)].concat([...Object.keys(DECK_ONE)]);
      if(this.state.dealt === false){
        
        switch (document.querySelector("#swap-deck-button").textContent.split(" ")[0]){
            case "Low": deckList = [...Object.keys(DECK_ONE)].concat([...Object.keys(DECK_ONE)]);
                        this.deck = DECK_ONE;
                        if(!document.querySelector("#shuffle-deck-button").textContent.endsWith("Unshuffled"))
                            deckList = this.shuffleDeck(deckList);
                        break;
            case "Mid": deckList = [...Object.keys(DECK_TWO)].concat([...Object.keys(DECK_TWO)]);
                        this.deck = DECK_TWO;
                        if(!document.querySelector("#shuffle-deck-button").textContent.endsWith("Unshuffled"))
                            deckList = this.shuffleDeck(deckList);
                        break;
            default: deckList = [...Object.keys(DECK_ONE)].concat([...Object.keys(DECK_ONE)]);
                     this.deck = DECK_ONE;
        }
        for(let grid of [GRIDS[0], GRIDS[2]]){
            for(let i = 0; i<5; i++){
                let poppedCard = deckList.pop();
                let openCell = document.querySelector(grid[0]).querySelectorAll(".card").length;
                let newDiv = new CubicCard (poppedCard, openCell, grid[0], this.deck[poppedCard]);
                newDiv.style.left = (grid[1][openCell][0] - 45) + "px"
                newDiv.style.top = (grid[1][openCell][1] - 45) + "px"
                newDiv.style.zIndex = newDiv.currentCell;
                newDiv.gameArea = grid[0];
                newDiv.player = (grid[0].startsWith("#left"))?"blue":"red";
                newDiv.onpointerdown = this.cardMouseDown;
                //newDiv.onpointerenter = this.cardHoverPreview;
                newDiv.style.backgroundColor = (grid[0].startsWith("#left"))?"blue":"red";
                document.querySelector(grid[0]).appendChild(newDiv);
                this.setState({
                    deckNum: deckList.length
                });
                if(deckList.length === 0){
                }   
            }
        }
        this.setState({
            dealt: true,
            turn: Math.round(Math.random())===0?"blue":"red"
        });
      }
      else{
          for(let each of document.querySelectorAll(".card")){
              document.querySelector(".card").parentElement.removeChild(each);
          }
          this.setState({
              dealt: false,
              turn: ""
          })
          deckList = [Object.keys(this.deck)];
      }

    }

    shuffleDeck(deck){
        let newDeck = [];
        let pickedCards = [];
        let randomIndex;
        for(let i=0; i<deck.length;i++){
            do{randomIndex = Math.floor(Math.random()*10);}
            while(pickedCards.includes(randomIndex));
            newDeck.push(deck[randomIndex]);
            pickedCards.push(randomIndex);
        }
        return newDeck;
    }

    componentDidMount(){
        document.querySelector("#start-button").onclick=this.startButton;
    }
    
    render(){

      return(
      <div id="super-container">
        <div id="outer-box">
          <div id="chooser">
              {/*stuff about choosing a game? tic-tac-toe or cubic?*/}
          </div>
          <div id="title-bar">
              <h1 style={{textAlign: "center"}}>{this.state.game}</h1>
          </div>
        </div>

        <GameGrids dealt={this.state.dealt} turn={this.state.turn}/>

        <div id="game-info">
        </div>

        <audio src="https://assets.codepen.io/4668860/card_down_1.wav" id="card-down-one" preload="auto"/>
        <audio src="https://assets.codepen.io/4668860/card_up_1.wav" id="card-up-one" preload="auto"/>
        <audio src="https://assets.codepen.io/4668860/card_up_2.wav" id="card-up-two" preload="auto"/>
        <audio src="https://assets.codepen.io/4668860/tone.wav " id="tone" preload="auto"/>
        
      </div>
      )
    }
}

class GameGrids extends React.Component{
    constructor(props){
        super(props);
        this.tab = "rules-basic-tab";
        this.rulesTextBasic = `There are two players: red and blue. First player is decided randomly. Players take turns by placing one card from their hand onto an empty spot on the board.

Each card has four numbers. Each number corresponds to a side of the card: top, left, right, and bottom. When a card is placed on the board adjacent to another card of opposing color, their adjacent (top vs. bottom, or left vs. right) values are compared. If the new card's value is greater than the opposing value of the card on the board, control of the card on the board is changed.

The game is completed when nine cards have been placed. The player in control of the most cards at the end of the game wins.`

        this.rulesTextAdv = `There are three extra rules that can be enabled: match, sum and chain. These rules apply when a new card is placed onto the board adjacent to two or more cards, with at least one of them being an opposing card.

Match:  If all opposing value pairs "match" (e.g. "1 and 1" and "2 and 2") any opposing cards adjacent to the placed card are flipped.

Sum: When all opposing value pairs "sum" to the same value (e.g. "1 and 3" and "2 and 2") any opposing cards adjacent to the placed card are flipped.

Chain: If an opposing card is flipped as the result of a 'match' or 'sum', that card acts as if it were just placed onto the board, under basic rules only. Cards flipped by 'match' or 'sum' with chain active cannot cause additional 'match' or 'sum' events, but can flip over opposing cards adjacent to it that have lower "opposing" values.`
    
        this.tabClick = this.tabClick.bind(this);
    }

    componentDidMount(){// removed dots from grids of hands
        function initGridDots(){
            for(let cell of GRID_POS){
              let newDiv = document.createElement("div");
              newDiv.className = "circle";
              newDiv.style.left = (cell[0]-5)+"px"
              newDiv.style.top = (cell[1]-5)+"px"
              document.querySelector("#main-box").appendChild(newDiv);
            }
        }
        initGridDots();
    }
    shuffleClick(event){
        event.currentTarget.textContent = event.currentTarget.textContent==="Deck Unshuffled"?"Deck Shuffled":"Deck Unshuffled";
    }

    swapClick(event){
        event.currentTarget.textContent = event.currentTarget.textContent==="Low Level Deck"?"Mid Level Deck":"Low Level Deck";
    }

    tabClick(event){
        console.log(event.currentTarget.id);
        if(event.currentTarget.id !== this.tab){
            let clickedTab = event.currentTarget;
            document.querySelector("#game-info-tabs").childNodes.forEach((x)=> {
                x.style.backgroundColor = x.id.startsWith(clickedTab.id)?"gray":"lightgray";
            });
            document.querySelector("#game-info-tab-box").childNodes.forEach((x)=> {
                x.classList.toggle("info-hide", x.id.startsWith(clickedTab.id)?false:true);
            });
            this.tab = clickedTab.id;
            

        }
    }

    render(){
        return(
          <div id="game-area">
            <div id="left-hand" className="hand-area">
  
            </div>
            <div id="main-box">
              {/*game board goes here*/}
              <div id="game-info">
                <h2>{(!this.props.turn)?"Press start to begin!":
                    (this.props.turn.length < 5)?`It is currently ${this.props.turn}'s turn`:this.props.turn}</h2>
                <button type="button" id="start-button">{this.props.dealt?"Restart":"Start"}</button>
                <div id="game-info-tabs">
                    <button type="button" id="rules-basic-tab" onClick={this.tabClick} style={{backgroundColor: "gray"}}>Rules</button>
                    <button type="button" id="rules-adv-tab" onClick={this.tabClick}>Adv. Rules</button>
                    <button type="button" id="options-tab" onClick={this.tabClick}>Options</button>
                </div>
                <div id="game-info-tab-box">
                    <div id="rules-basic-tab-info" style={{textAlign: "start"}}>
                        <p>{this.rulesTextBasic}</p>
                    </div><div id="rules-adv-tab-info" style={{textAlign: "start"}} className="info-hide">
                        <p>{this.rulesTextAdv}</p>
                    </div>
                    <div id="options-tab-info" className="info-hide">
                      <form name="options" style={{textAlign: "right"}}>
                        <label>Adv. Rule: Sum<input type="checkbox" name="sum-check" id="sum-check"/></label>
                        <label>Adv. Rule: Match<input type="checkbox" name="match-check" id="match-check"/></label>
                        <label>Adv. Rule: Chain<input type="checkbox" name="chain-check" id="chain-check"/></label>
                        <label>Sound<input type="checkbox" name="sound-check" id="sound-check"/></label>
                        <button type="button" name="swap" id="swap-deck-button" onClick={this.swapClick}>Low Level Deck</button>
                        <button type="button" name="shuffle" id="shuffle-deck-button" onClick={this.shuffleClick}>Deck Unshuffled</button>
                      </form>
                    </div>
                </div>
              </div>
            </div>
            <div id="right-hand" className="hand-area">
  
            </div>
          </div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector("#origin"))

/*
to do:

--fix card coloring issues--
--split a section off into a child component
--add 'hands'--
--add turns--
--add victory condition--
--added imports for constants and the custom card element--

--options like shuffle, reset deck, sound on/off
--touch 

--refactor card placement from aligning to cell center, to cell edges
  -this will allow easy swapping between a grid based alignment and
   an edge based alignment, for future use in a free-form tile application
--add tic-tac-toe via cards?
--button for switching between tic-tac-toe / cubic

*/