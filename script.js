myCanvas.width = 400;
myCanvas.height = 300;
const margin = 30;
const n = 20;
const array = [];
let moves = [];
const cols = [];
const spacing = (myCanvas.width - margin*2) / n;
const ctx = myCanvas.getContext("2d");
const maxColumnHeight = 200;
let audioCtx = null;

randomFill();
animate();


function playNote(freq, type){
    if (audioCtx==null){
        audioCtx = new( AudioContext || webkitAudioContext || window.webkitAudioContext )();
    }
    const dur = 0.2;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.type = type; 
    osc.stop(audioCtx.currentTime + dur);

    const node = audioCtx.createGain();
    node.gain.value = 0.4;
    node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    osc.connect(node);
    node.connect(audioCtx.destination);

}
function randomFill(){
    for (let i=0;i<n;i++){
        array[i] = Math.random();
    }
    moves = [];
    for (let i=0;i<array.length;i++){
        const x = i*spacing + spacing/2 + margin;
        const y = myCanvas.height - margin - i*3 ;
        const width = spacing - 4;
        const height = maxColumnHeight * array[i];
        cols[i] = new Column(x, y ,width, height) ;
    }
}

function disableSortingButtons() {
    const sortingButtons = document.querySelectorAll('.btn button');
    sortingButtons.forEach(button => {
        button.disabled = true;
        button.style.cursor = 'not-allowed';
    });
}

function enableSortingButtons() {
    const sortingButtons = document.querySelectorAll('.btn button');
    sortingButtons.forEach(button => {
        button.disabled = false;
        button.style.cursor = 'pointer';
    });
}

// BUBBLE SORT
function sortBubble(){
    disableSortingButtons();
    moves = bubbleSort(array);
}
function bubbleSort(array){
    const moves = [];
        
    for (let i=0;i<array.length-1;i++){
        for (let j=0;j<array.length-i-1;j++){

            if (array[j] > array[j+1]){
                [array[j],array[j+1]] = [array[j+1],array[j]];
                moves.push({ indices : [j, j+1], swap:true });
            }
            else{
                moves.push({ indices : [j, j+1], swap:false });
            }
        }
    }
    return moves;
}


// INSERTION SORT
function sortInsertion(){
    disableSortingButtons();
    moves = insertionSort(array);
}
function insertionSort(array){
    const moves = [];
    let swapped;

    for (let i = 1; i < array.length; i++) {
        let current = array[i];
        let j = i;
        swapped = false;

        while (j > 0 && array[j-1] > current) {
            array[j] = array[j-1];
            moves.push({ indices: [j, j-1], swap: true });
            j--;
            swapped = true;
        }

        array[j] = current;
        if (!swapped){
            moves.push({ indices: [j, j - 1], swap: false });
        }

        if (j > 0){
            moves.push({ indices: [j, j - 1], jump: true });
        }
        
    }
    return moves;
}


// SELECTION SORT
function sortSelection(){
    disableSortingButtons();
    moves = selectionSort(array);
}
function selectionSort(array){
    const moves = [];

    for (let i=0;i<array.length-1;i++){
        let minIndex = i;

        // Find the minimum element in the unsorted part of the array
        for (let j=i+1; j<array.length;j++){
            if(array[j]<array[minIndex]){
                minIndex = j;
            }
            moves.push({ indices : [j, minIndex], compare:true });
        }

        // Swap the minimum element with the current element if necessary
        if (minIndex != i){
            [array[i],array[minIndex]] = [array[minIndex],array[i]];
            moves.push({ indices : [i, minIndex], swap:true });
        }
        else{
            moves.push({ indices : [i,minIndex], swap:false });
        }
    }
    return moves;
}



function animate(){
    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);
    let changed = false;

    for (let i=0;i<cols.length;i++){
        changed = cols[i].draw(ctx) || changed;
    }

    if (!changed && moves.length>0){
        const move = moves.shift();
        const [i,j] = move.indices;
        const wavefromType = move.swap?"square":"sine";
        playNote(cols[i].height+cols[j].height, wavefromType);
        if (move.swap){
            cols[i].moveTo(cols[j]);
            cols[j].moveTo(cols[i],-1);
            [cols[i],cols[j]]=[cols[j],cols[i]];
        }
        else{
            cols[i].jump();
            cols[j].jump();
        }

    }

    else if (!changed && moves.length === 0) {
        // Sorting is completed, turn all columns color to aqua
        for (let i = 0; i < cols.length; i++) {
          cols[i].color = { r: 0, g: 255, b: 255 };
        }
        enableSortingButtons();
    }
    requestAnimationFrame(animate);
}