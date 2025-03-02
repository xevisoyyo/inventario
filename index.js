const items = [];
const bag = [
  { id: 1, empty: true },
  { id: 2, empty: true },
  { id: 3, empty: true },
  { id: 4, empty: true },
  { id: 5, empty: true },
  { id: 6, empty: true },
  { id: 7, empty: true },
  { id: 8, empty: true },
  { id: 9, empty: true },
  { id: 10, empty: true },
  { id: 11, empty: true },
  { id: 12, empty: true },
  { id: 13, empty: true },
  { id: 14, empty: true },
  { id: 15, empty: true },
  { id: 16, empty: true },
];
const res = [
  { id: 1, empty: true },
  { id: 2, empty: true },
  { id: 3, empty: true },
  { id: 4, empty: true },
  { id: 5, empty: true },
  { id: 6, empty: true },
  { id: 7, empty: true },
  { id: 8, empty: true },
];
const con = [
  { id: 1, empty: true },
  { id: 2, empty: true },
  { id: 3, empty: true },
  { id: 4, empty: true },
];
const points = [];

const canvas = document.getElementById('lines-container');
const ctx = canvas.getContext('2d');
const body = document.body;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
window.addEventListener('resize', ()=>{
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
});


let mouseOffset = {x: 0, y: 0};
const squareSize = 50;
const squareHalf = 25;

createGrid("grid-bag", 16);
createGrid("grid-resources", 8);
createGrid("grid-consumables", 4);

addItem({name: "A",					width: 1, height: 1, x: 20, y: 10, type: "bag"});
addItem({name: "B", 				width: 1, height: 1, x: 40, y: 10, type: "bag"});
addItem({name: "C", 				width: 1, height: 1, x: 60, y: 10, type: "bag"});
addItem({name: "Palo", 			width: 2, height: 1, x: 40, y: 70, type: "bag"});
addItem({name: "Casco", 		width: 2, height: 2, x: 60, y: 150, type: "bag"});
addItem({name: "D", 				width: 1, height: 1, x: 10, y: 90, type: "resources"});
addItem({name: "E", 				width: 1, height: 1, x: 10, y: 120, type: "resources"});
addItem({name: "G",				 	width: 1, height: 1, x: 10, y: 140, type: "resources"});
addItem({name: "Recurso", 	width: 2, height: 1, x: 70, y: 70, type: "resources"});
addItem({name: "H", 				width: 1, height: 1, x: 40, y: 180, type: "consumables"});
addItem({name: "Manzanas", 	width: 2, height: 1, x: 70, y: 150, type: "consumables"});

function createGrid(containerId, cellCount) {
  const grid = document.getElementById(containerId);
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
		cell.setAttribute("data-id", i + 1);
    grid.appendChild(cell);
  }
}

function addItem({name, width, height, x, y, type}) {
  const item = {
		id: items.length,
    name,
    width,
    height,
    type
  };
  items.push(item);
  createItemElement(item, {x, y});
}

function createItemElement(item, {x, y}) {
  const itemElement = document.createElement("div");
  itemElement.classList.add("item", `item-${item.width}x${item.height}`);
  itemElement.textContent = item.name;
  itemElement.style.left = `${x}px`;
  itemElement.style.top = `${y}px`;
  itemElement.setAttribute("data-type", item.type);
	itemElement.setAttribute("data-itemid", item.id);
  itemElement.addEventListener("mousedown", onItemGrab);
  document.body.appendChild(itemElement);
}

function onItemGrab(event) {
	const itemElement = event.target;
	setFreePoints(itemElement);
	const itemRect = itemElement.getBoundingClientRect();
	mouseOffset.x = event.clientX - itemRect.left;
 	mouseOffset.y = event.clientY - itemRect.top;

  itemElement.classList.add("grabbing");
  itemElement.addEventListener("mousemove", onItemMove);
  itemElement.addEventListener("mouseup", onItemDrop);
}

function onItemMove(event) {
	const itemElement = event.target;
	let x = event.clientX - mouseOffset.x;
	let y = event.clientY - mouseOffset.y;
  itemElement.style.left = x + "px";
  itemElement.style.top = y + "px";
	
	const itemRect = itemElement.getBoundingClientRect();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(let i = 0; i < points.length; i++){
		ctx.beginPath();
		ctx.moveTo(x + itemRect.width / 2, y + itemRect.height / 2);
		ctx.lineTo(points[i].x, points[i].y);
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 0.4;
		ctx.stroke();
	}
}

function onItemDrop(event) {

	console.log("Cell ID: " + event.target.getAttribute("data-id"));
	console.log("Cell ID: " + event.target.dataset.id);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const itemElement = event.target;
	itemElement.classList.remove("grabbing");
	itemElement.removeEventListener("mousemove", onItemMove);
	itemElement.removeEventListener("mouseup", onItemDrop);

	const itemId = itemElement.getAttribute("data-itemid");
	const item = items[itemId];
	
	const grid = getActiveGrid();
	const activeGridRect = grid.getBoundingClientRect();
	const itemRect = itemElement.getBoundingClientRect();

	if (
    activeGridRect.right < itemRect.left ||
    activeGridRect.left > itemRect.right ||
    activeGridRect.bottom < itemRect.top ||
    activeGridRect.top > itemRect.bottom
  ){
		const inventoryRect = document.getElementById("inventory").getBoundingClientRect();
		if(inventoryRect.right > itemRect.left &&
			inventoryRect.left + 210 < itemRect.right) itemElement.style.left = `${inventoryRect.right + 10}px`;
		else if(inventoryRect.left < itemRect.right &&
			inventoryRect.right - 210 > itemRect.left) itemElement.style.left = `${inventoryRect.left - 10 - item.width * squareSize}px`;
	
	}
	else{
		let shorterPoint= {x: 0, y: 0};
		let shorterDistance = 5000;
		let distance;
		for(let i = 0; i < points.length; i++){
			distance = Math.sqrt(Math.pow(points[i].x - itemRect.width/2 - itemRect.x, 2) + Math.pow(points[i].y - itemRect.height/2 - itemRect.y, 2));
			if(distance < shorterDistance) {
				shorterDistance = distance;
				shorterPoint.x = points[i].x - item.width * squareHalf + 1;
				shorterPoint.y = points[i].y - item.height * squareHalf + 1;
			}
		}

		itemElement.style.left = `${shorterPoint.x}px`;
		itemElement.style.top = `${shorterPoint.y}px`;

		if(item.width === 1){
			let indexX = (shorterPoint.x - activeGridRect.x - 1) / 50 + 1;
			let indexY = (shorterPoint.y - activeGridRect.y - 1) / 50 + 1;
			let index = (indexY - 1) * 4 + (indexX - 1);
			console.log(indexX + ", " + indexY + " = " + index);
			console.log(grid)
			grid[index].empty = false;
		}
		else if(item.width === 2 && item.height === 1){

		}
		else if(item.width === 2 && item.height === 2){

		}
	}

  points.length = 0;
	removeActiveGrid();
}

function setActiveGrid(type){
    document.body.setAttribute("data-active-grid", type);		
}

function getActiveGrid(){
	let gridName = "grid-" + document.body.getAttribute("data-active-grid");
	return document.getElementById(gridName);
}

function removeActiveGrid(){
    document.body.removeAttribute("data-active-grid");
}

function setFreePoints(el){
	const itemId = el.dataset.itemid;
	const itemType = el.dataset.type;
  setActiveGrid(itemType);
	let item = items[parseInt(itemId,10)];
	const gridRect = document.getElementById(`grid-${item.type}`).getBoundingClientRect();
	let gridArray;
	let cols;
	switch (itemType){
		case "bag":
			cols = 4;
			gridArray = bag;
		break;
		case "resources":
			cols = 2;
			gridArray = res;
		break;
		case "consumables":		
			cols = 4;
			gridArray = con;
	}
	if(item.width === 1){
		for(let i = 0; i < gridArray.length; i++){
			if(gridArray[i].empty){
				console.log(gridArray[i].id + " is valid to place an item of 1x1");
				const point = {x: gridRect.x + (cols - (i%cols) - 1 ) * squareSize + squareHalf, y: gridRect.y + Math.floor(i/cols) * squareSize + squareHalf};
				points.push(point);
			}
			else console.log(gridArray[i].id + " is NOT valid to place an item of 1x1");
		}
	}
	else if(item.width === 2 && item.height === 1){
		for(let i = 0; i < gridArray.length; i++){
			if((i+1) % cols !== 0 && gridArray[i].empty && gridArray[i+1].empty){
				console.log(gridArray[i].id + " is valid to place an item of 2x1");
				const point = {x: gridRect.x + (cols - (i%cols) - 1 ) * squareSize, y: gridRect.y + Math.floor(i/cols) * squareSize + squareHalf};
				points.push(point);
			}
		}
	}
	else if(item.width === 2 && item.height === 2){
		for(let i = 0; i < (gridArray.length - 4); i++){
			if((i+1) % 4 !== 0 && gridArray[i].empty && gridArray[i+1].empty && gridArray[i+4].empty && gridArray[i+5].empty){
				console.log(gridArray[i].id + " is valid to place an item of 2x2");
				const point = {x: gridRect.x + (cols - (i%cols) - 1 ) * squareSize, y: gridRect.y + Math.floor(i/cols) * squareSize + squareSize};
				points.push(point);
			}
		}
	}
}