let selectedItem = {};
const items = [];

let selectedGrid = {};
const bag = {
	cols: 4,
	rows: 4,
	element: null,
	rect: null,
};

const res = {
	cols: 2,
	rows: 4,
	element: null,
	rect: null,
}
const con = {
	cols: 4,
	rows: 1,
	element: null,
	rect: null,
}
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

createGridsAndItems();

function createGridsAndItems(){
	const center = window.innerWidth / 2;

	createGrid("bag", 16);
	createGrid("resources", 8);
	createGrid("consumables", 4);

	createItem({type: "bag",			name: "A",			width: 1, height: 1, y: 30, x: center - 242});
	createItem({type: "bag",			name: "B", 			width: 1, height: 1, y: 90, x: center - 242});
	createItem({type: "bag",			name: "C", 			width: 1, height: 1, y: 150, x: center - 242});
	createItem({type: "bag",			name: "D", 			width: 1, height: 1, y: 210, x: center - 242});
	createItem({type: "bag",			name: "Palo", 		width: 2, height: 1, y: 270, x: center - 292});
	createItem({type: "bag",			name: "Chancletas",	width: 2, height: 1, y: 330, x: center - 292});
	createItem({type: "bag",			name: "Casco", 		width: 2, height: 2, y: 390, x: center - 292});
	createItem({type: "bag",			name: "Motosierra",	width: 2, height: 2, y: 500, x: center - 292});
	createItem({type: "resources",		name: "E", 			width: 1, height: 1, y: 30, x: center + 192});
	createItem({type: "resources",		name: "F", 			width: 1, height: 1, y: 90, x: center + 192});
	createItem({type: "resources",		name: "Recurso", 	width: 2, height: 1, y: 150, x: center + 192});
	createItem({type: "resources",		name: "Recurso 2", 	width: 2, height: 2, y: 210, x: center + 192});
	createItem({type: "consumables",	name: "G", 			width: 1, height: 1, y: 320, x: center + 192});
	createItem({type: "consumables",	name: "H", 			width: 1, height: 1, y: 380, x: center + 192});
	createItem({type: "consumables",	name: "Manzanas", 	width: 2, height: 1, y: 440, x: center + 192});
}

function createGrid(type, nomberOfCells) {
	let grid = getGrid(type);
	grid.element = document.getElementById(`grid-${type}`);
	
	for (let i = 0; i < nomberOfCells; i++) {
		const cellElement = document.createElement("div");
		cellElement.classList.add("cell");
		cellElement.setAttribute("data-id", i + 1);
		grid.element.appendChild(cellElement);
	}
}

function createItem({name, width, height, type, x, y}) {
	// crea el item (objeto)
	const item = {
		id: items.length,
		name,
		width,
		height,
		type,
		element: document.createElement("div"),
		rect: null,
		x,
		y,
	};
	// crea el item (elemento) ^
	item.element.classList.add("item", `item-${item.width}x${item.height}`);
	item.element.textContent = item.name;
	item.element.style.left = `${x}px`;
	item.element.style.top = `${y}px`;
	item.element.setAttribute("data-type", item.type);
	item.element.setAttribute("data-itemid", item.id);
	item.element.addEventListener("mousedown", onItemGrab);

	// agrega el item al array de items y el item.element al body
	items.push(item);
	document.body.appendChild(item.element);
}

function onItemGrab(event) {
	selectedItem = items[parseInt(event.target.dataset.itemid,10)];
	selectedItem.rect = selectedItem.element.getBoundingClientRect();

	selectedGrid = getGrid(selectedItem.type);
	selectedGrid.rect = selectedGrid.element.getBoundingClientRect();

	setPoints();

	mouseOffset.x = event.pageX - selectedItem.rect.left;
 	mouseOffset.y = event.pageY - selectedItem.rect.top;

	setActiveGrid(selectedItem.type);
	selectedItem.element.classList.add("grabbing");
	document.addEventListener("mousemove", onItemMove);
	selectedItem.element.addEventListener("mouseup", onItemDrop);
}

function setPoints(){
	points.length = 0;

	const gridRectX = selectedGrid.rect.x;
	const gridRectY = selectedGrid.rect.y;

	let gridCells = selectedGrid.cols * selectedGrid.rows;
	let gridCols = selectedGrid.cols;

	if(selectedItem.width === 1){
		for(let i = 0; i < gridCells; i++){
			const point = { x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize + squareHalf, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareHalf };
			let uniquePoint = document.elementFromPoint(point.x, point.y);
			if(uniquePoint.className === "cell"	|| uniquePoint === selectedItem.element){
				point.empty = true;
			}
			else point.empty = false;
			points.push(point);
		}
	}
	else if(selectedItem.width === 2 && selectedItem.height === 1){
		for(let i = 0; i < gridCells; i++){
			if((i+1) % gridCols !== 0){
				const point = {x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareHalf};
				let rightPoint = document.elementFromPoint(point.x + 5, point.y);
				let leftPoint = document.elementFromPoint(point.x - 5, point.y);
				if( (rightPoint.className === "cell" || rightPoint === selectedItem.element) &&
					(leftPoint.className === "cell" || leftPoint === selectedItem.element))
				{
					point.empty = true;
				}
				else point.empty = false;
				points.push(point);
			}
		}
	}
	else if(selectedItem.width === 2 && selectedItem.height === 2){
		let cellsArrayLength = gridCells - 4;
		for(let i = 0; i < cellsArrayLength; i++){
			if((i+1) % 4 !== 0){
				const point = {x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareSize};
				let topRightPoint = document.elementFromPoint(point.x + 5, point.y + 5);
				let topLeftPoint = document.elementFromPoint(point.x - 5, point.y + 5);
				let botRightPoint = document.elementFromPoint(point.x + 5, point.y - 5);
				let botLeftPoint = document.elementFromPoint(point.x - 5, point.y - 5);
				if( (topRightPoint.className === "cell" || topRightPoint === selectedItem.element) &&
					(topLeftPoint.className === "cell" || topLeftPoint === selectedItem.element) &&
					(botRightPoint.className === "cell" || botRightPoint === selectedItem.element) &&
					(botLeftPoint.className === "cell" || botLeftPoint === selectedItem.element))
				{
					point.empty = true;
				}
				else point.empty = false;
				points.push(point);
			}
		}
	}
}

function onItemMove(event) {
	selectedItem.x = event.clientX - mouseOffset.x;
	selectedItem.y = event.clientY - mouseOffset.y;
	selectedItem.element.style.left = selectedItem.x + "px";
	selectedItem.element.style.top = selectedItem.y + "px";
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(let i = 0; i < points.length; i++){
		ctx.beginPath();
		ctx.moveTo(selectedItem.x + selectedItem.rect.width / 2, selectedItem.y + selectedItem.rect.height / 2);
		ctx.lineTo(points[i].x, points[i].y);

		if( points[i].empty ) ctx.strokeStyle = "#00ff00";
		else ctx.strokeStyle = "#ff0000";

		ctx.lineWidth = 0.8;
		ctx.stroke();
	}
}

function onItemDrop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	selectedItem.rect = selectedItem.element.getBoundingClientRect(); // hay que actualizar el BoundingClientRect del item porque la posición ha cambiado (en onItemMove no hacía falta actualizarlo porque no se usan las posiciones x e y)
	selectedItem.element.classList.remove("grabbing");
	document.removeEventListener("mousemove", onItemMove);
	selectedItem.element.removeEventListener("mouseup", onItemDrop);
	
	const gridRect = selectedGrid.rect;
	const itemRect = selectedItem.rect;

	// fuera del grid
	if (
		gridRect.right < itemRect.left ||
		gridRect.left > itemRect.right ||
		gridRect.bottom < itemRect.top ||
		gridRect.top > itemRect.bottom
  	){
		const inventoryRect = document.getElementById("inventory").getBoundingClientRect();
		if(inventoryRect.right > itemRect.left &&
			inventoryRect.left + 210 < itemRect.right) selectedItem.element.style.left = `${inventoryRect.right + 10}px`;
		else if(inventoryRect.left < itemRect.right &&
			inventoryRect.right - 210 > itemRect.left) selectedItem.element.style.left = `${inventoryRect.left - 10 - selectedItem.width * squareSize}px`;
	
	}
	// dentro del grid
	else{
		let shorterPoint= {x: 0, y: 0};
		let shorterDistance = 5000;
		let distance;
		for(let i = 0; i < points.length; i++){
			if ( points[i].empty ){
				distance = Math.sqrt(Math.pow(points[i].x - itemRect.width/2 - itemRect.x, 2) + Math.pow(points[i].y - itemRect.height/2 - itemRect.y, 2));
				if(distance < shorterDistance) {
					shorterDistance = distance;
					shorterPoint.x = points[i].x - selectedItem.width * squareHalf + 1;
					shorterPoint.y = points[i].y - selectedItem.height * squareHalf + 1;
				}
			}
		}

		if(distance){
			selectedItem.element.style.left = `${shorterPoint.x}px`;
			selectedItem.element.style.top = `${shorterPoint.y}px`;
		}
	}
	removeActiveGrid();
}

function getGrid(type){
	switch(type){
		case "bag":
			return bag;
		case "resources":
			return res;
		case "consumables":
			return con;
	}
}

function setActiveGrid(type){
    document.body.setAttribute("data-active-grid", type);		
}

function removeActiveGrid() {
    document.body.setAttribute("data-active-grid", ""); // no lo borro para que la transición al quitarlo tenga efecto
}

function isPointEmpty(pointX, pointY){
	let firstElement = null;
	const elements = document.elementsFromPoint(pointX, pointY);
	const filteredElements = elements.filter(elemento => elemento !== selectedItem.element);

	if (filteredElements.length > 0) {
		firstElement = filteredElements[0]; // Obtener el elemento superior

		if( // si el punto obtenido no devuelve un elemento cell, significa que está ocupado o fuera del grid (puede ser fuera ya que con los items de más de 1x1 compruebo los puntos adyacentes también)
			(selectedItem.width === 1 && document.elementFromPoint(pointX, pointY).className === "cell") ||
			(selectedItem.width === 2 && selectedItem.height === 1 &&
				(
					(document.elementFromPoint(pointX + 5, pointY).className === "cell") &&
					(document.elementFromPoint(pointX - 5, pointY).className === "cell")
				)
			) ||
			(selectedItem.width === 2 && selectedItem.height === 2 &&
				(
					(document.elementFromPoint(pointX - 5, pointY + 5).className === "cell") &&
					(document.elementFromPoint(pointX + 5, pointY + 5).className === "cell") &&
					(document.elementFromPoint(pointX + 5, pointY - 5).className === "cell") &&
					(document.elementFromPoint(pointX - 5, pointY - 5).className === "cell")
				)
			)
		) return true;
		else return false;
	} else return false;
}

// jugando un poco con lo sitems

function robot(){
	console.log("Botón Robot clicado!");
	alert("Botón Robot clicado!");
	const it = document.querySelectorAll(".item");
	 it[0].style = "left: calc(50% + 192px); top: calc(50% - 370px)";	// A
	 it[1].style = "left: calc(50% + 192px); top: calc(50% - 310px)";	// B
	 it[2].style = "left: calc(50% + 192px); top: calc(50% - 250px)";	// C
	 it[3].style = "left: calc(50% + 192px); top: calc(50% - 190px)";	// D
	 it[4].style = "left: calc(50% + 192px); top: calc(50% - 130px)";	// Palo
	 it[5].style = "left: calc(50% + 192px); top: calc(50% - 130px)";	// Chancletas
	 it[6].style = "left: calc(50% + 192px); top: calc(50% - 70px)"; 	// Casco
	 it[7].style = "left: calc(50% + 192px); top: calc(50% - 70px)"; 	// Motosierra
	 it[8].style = "left: calc(50% - 242px); top: calc(50% - 370px)";	// E
	 it[9].style = "left: calc(50% - 242px); top: calc(50% - 310px)";	// F
	it[10].style = "left: calc(50% - 292px); top: calc(50% - 130px)";	// Recurso
	it[11].style = "left: calc(50% - 292px); top: calc(50% - 70px)";	// Recurso 2
	it[12].style = "left: calc(50% - 242px); top: calc(50% - 250px)";	// G
	it[13].style = "left: calc(50% - 242px); top: calc(50% - 190px)";	// H
	it[14].style = "left: calc(50% - 292px); top: calc(50% - 130px)";	// Manzanas
}

function createMenu(){
	const menu = document.createElement("div");
	menu.id = "menu";
	menu.className = "menu";

	const robot = document.createElement("button");
	robot.textContent = "Robot";
	robot.addEventListener("click", robot);
	menu.appendChild(robot);
	
	document.body.appendChild(menu);
}
createMenu();