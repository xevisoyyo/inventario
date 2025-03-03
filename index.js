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
let showRays = false;

createGridsAndItems();

function createGridsAndItems(){
	createGrid("bag", 16);
	createGrid("resources", 8);
	createGrid("consumables", 4);

	createItem({type: "bag",			name: "A",			width: 1, height: 1});
	createItem({type: "bag",			name: "B", 			width: 1, height: 1});
	createItem({type: "bag",			name: "C", 			width: 1, height: 1});
	createItem({type: "bag",			name: "D", 			width: 1, height: 1});
	createItem({type: "bag",			name: "Palo", 		width: 2, height: 1});
	createItem({type: "bag",			name: "Chancletas",	width: 2, height: 1});
	createItem({type: "bag",			name: "Casco", 		width: 2, height: 2});
	createItem({type: "bag",			name: "Motosierra",	width: 2, height: 2});
	createItem({type: "resources",		name: "E", 			width: 1, height: 1});
	createItem({type: "resources",		name: "F", 			width: 1, height: 1});
	createItem({type: "resources",		name: "Recurso", 	width: 2, height: 1});
	createItem({type: "resources",		name: "Recurso 2", 	width: 2, height: 2});
	createItem({type: "consumables",	name: "G", 			width: 1, height: 1});
	createItem({type: "consumables",	name: "H", 			width: 1, height: 1});
	createItem({type: "consumables",	name: "Manzanas", 	width: 2, height: 1});

	makeAMess();
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
		let cellsArrayLength = gridCols * 3;
		for(let i = 0; i < cellsArrayLength; i++){
			if((i+1) % gridCols !== 0){
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
	
	if(!showRays) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(let i = 0; i < points.length; i++){
		ctx.beginPath();
		ctx.moveTo(selectedItem.x + selectedItem.rect.width / 2, selectedItem.y + selectedItem.rect.height / 2);
		ctx.lineTo(points[i].x, points[i].y);

		if( points[i].empty ) ctx.strokeStyle = "rgb(22, 128, 22)";
		else ctx.strokeStyle = "rgb(139, 32, 32)";

		ctx.lineWidth = 2;
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
	const margin = 10;

	// fuera del grid actual
	if (
		gridRect.right < itemRect.left ||
		gridRect.left > itemRect.right ||
		gridRect.bottom < itemRect.top ||
		gridRect.top > itemRect.bottom
  	){
		const inventoryRect = document.getElementById("inventory").getBoundingClientRect();

		// límites de inventoryRect con el margen
		const marginInventoryRect = {
			left: inventoryRect.left - margin,
			top: inventoryRect.top - margin,
			right: inventoryRect.right + margin,
			bottom: inventoryRect.bottom + margin,
		};
	
		// comprueba si itemRect está dentro de inventoryRect con margen
		if (
			itemRect.left < marginInventoryRect.right &&
			itemRect.right > marginInventoryRect.left &&
			itemRect.top < marginInventoryRect.bottom &&
			itemRect.bottom > marginInventoryRect.top
		) {
			// como hay colision, calcula los centros de los rectángulos
			const itemCenterX = itemRect.left + itemRect.width / 2;
			const itemCenterY = itemRect.top + itemRect.height / 2;
			const inventoryCenterX = inventoryRect.left + inventoryRect.width / 2;
			const inventoryCenterY = inventoryRect.top + inventoryRect.height / 2;
	
			// y determina la dirección de la colisión basada en los centros
			if (Math.abs(itemCenterX - inventoryCenterX) > Math.abs(itemCenterY - inventoryCenterY)) {
				// colisión horizontal
				if (itemCenterX > inventoryCenterX) { // mueve a la derecha
					selectedItem.element.style.left = `${marginInventoryRect.right}px`;
				} else {// mueve a la izquierda
					selectedItem.element.style.left = `${marginInventoryRect.left - itemRect.width}px`;
				}
			} else {
				// colisión vertical
				if (itemCenterY > inventoryCenterY) { // mueve hacia abajo
					selectedItem.element.style.top = `${marginInventoryRect.bottom}px`;
				} else { // mueve hacia arriba
					selectedItem.element.style.top = `${marginInventoryRect.top - itemRect.height}px`;
				}
			}
		}
	}
	// dentro del grid actual
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
		// si hay distancia es porque hay como minímo un espacio para ese item
		if(distance){
			selectedItem.element.style.left = `${shorterPoint.x}px`;
			selectedItem.element.style.top = `${shorterPoint.y}px`;
		}
		// si no hay distancia es porque no hay ningún espacio para ese item (se devuelve al origen)
		else {
			const inventoryRect = document.getElementById("inventory").getBoundingClientRect();
			console.log(selectedItem.rect)
			console.log(inventoryRect)
			if((selectedItem.rect.left + selectedItem.rect.width/2) > (inventoryRect.left + inventoryRect.width/2)) selectedItem.element.style.left = `${inventoryRect.right + margin}px`;
			else selectedItem.element.style.left = `${inventoryRect.left - selectedItem.rect.width - margin}px`;
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

// jugando un poco con los items
createMenu();

function makeARobot(){
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
function makeASpider(){
	const it = document.querySelectorAll(".item");
	 it[0].style = "left: calc(50% - 242px); top: calc(50% + 210px)";	// A
	 it[1].style = "left: calc(50% + 62px); top: calc(50% + 202px)";	// B
	 it[2].style = "left: calc(50% - 82px); top: calc(50% + 195px)";	// C
	 it[3].style = "left: calc(50% + 302px); top: calc(50% + 190px)";	// D
	 it[4].style = "left: calc(50% + 242px); top: calc(50% + 160px)";	// Palo
	 it[5].style = "left: calc(50% - 322px); top: calc(50% + 140px)";	// Chancletas
	 it[6].style = "left: calc(50% - 285px); top: calc(50% + 90px)"; 	// Casco
	 it[7].style = "left: calc(50% + 190px); top: calc(50% + 80px)"; 	// Motosierra
	 it[8].style = "left: calc(50% + 52px); top: calc(50% + 182px)";	// E
	 it[9].style = "left: calc(50% - 92px); top: calc(50% + 182px)";	// F
	it[10].style = "left: calc(50% + 122px); top: calc(50% + 155px)";	// Recurso
	it[11].style = "left: calc(50% - 232px); top: calc(50% + 140px)";	// Recurso 2
	it[12].style = "left: calc(50% - 262px); top: calc(50% + 250px)";	// G
	it[13].style = "left: calc(50% - 322px); top: calc(50% + 160px)";	// H
	it[14].style = "left: calc(50% + 162px); top: calc(50% + 190px)";	// Manzanas
}
function makeADeer(){
	const it = document.querySelectorAll(".item");
	 it[0].style = "left: calc(50% - 252px); top: calc(50% - 320px)";	// A
	 it[1].style = "left: calc(50% - 322px); top: calc(50% - 182px)";	// B
	 it[2].style = "left: calc(50% + 192px); top: calc(50% - 300px)";	// C
	 it[3].style = "left: calc(50% + 242px); top: calc(50% - 180px)";	// D
	 it[4].style = "left: calc(50% + 178px); top: calc(50% - 150px)";	// Palo
	 it[5].style = "left: calc(50% + 222px); top: calc(50% - 280px)";	// Chancletas
	 it[6].style = "left: calc(50% + 295px); top: calc(50% - 340px)"; 	// Casco
	 it[7].style = "left: calc(50% + 255px); top: calc(50% - 260px)"; 	// Motosierra
	 it[8].style = "left: calc(50% - 402px); top: calc(50% - 282px)";	// E
	 it[9].style = "left: calc(50% - 301px); top: calc(50% - 192px)";	// F
	it[10].style = "left: calc(50% - 322px); top: calc(50% - 300px)";	// Recurso
	it[11].style = "left: calc(50% - 371px); top: calc(50% - 275px)";	// Recurso 2
	it[12].style = "left: calc(50% + 252px); top: calc(50% - 170px)";	// G
	it[13].style = "left: calc(50% - 392px); top: calc(50% - 309px)";	// H
	it[14].style = "left: calc(50% - 276px); top: calc(50% - 170px)";	// Manzanas
}
function makeAMess(){
	const it = document.querySelectorAll(".item");
	 it[0].style = `left: calc(50% + 320px); top: calc(50% - 220px)`;	// A
	 it[1].style = `left: calc(50% + 192px); top: calc(50% - 310px)`;	// B
	 it[2].style = `left: calc(50% - 192px); top: calc(50% + 222px)`;	// C
	 it[3].style = `left: calc(50% + 380px); top: calc(50% - 32px)`;	// D
	 it[4].style = `left: calc(50% - 312px); top: calc(50% + 32px)`;	// Palo
	 it[5].style = `left: calc(50% - 332px); top: calc(50% - 142px)`;	// Chancletas
	 it[6].style = `left: calc(50% + 192px); top: calc(50% + 192px)`; 	// Casco
	 it[7].style = `left: calc(50% - 82px); top: calc(50% - 322px)`; 	// Motosierra
	 it[8].style = `left: calc(50% - 362px); top: calc(50% + 122px)`;	// E
	 it[9].style = `left: calc(50% - 292px); top: calc(50% - 292px)`;	// F
	it[10].style = `left: calc(50% - 392px); top: calc(50% - 62px)`;	// Recurso
	it[11].style = `left: calc(50% + 222px); top: calc(50% - 132px)`;	// Recurso 2
	it[12].style = `left: calc(50% + 282px); top: calc(50% + 112px)`;	// G
	it[13].style = `left: calc(50% - 422px); top: calc(50% - 192px)`;	// H
	it[14].style = `left: calc(50% - 310px); top: calc(50% + 252px)`;	// Manzanas
}
function switchRays(el){
	if(showRays){
		showRays = false;
		el.textContent = "Activar rayos";
		el.classList.remove("show");
	}
	else{
		showRays = true;
		el.textContent = "Desctivar rayos";
		el.classList.add("show");
	}
}
function getRandom(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function createMenu(){
	const menu = document.getElementById("menu");
	menu.addEventListener("click", (e)=>{
		const el = e.target;
		switch (el.id){
			case "random":
				makeAMess();
				break;
			case "deer":
				makeADeer();
				break;
			case "robot":
				makeARobot();
				break;
			case "spider":
				makeASpider();
				break;
			case "switch-rays":
				switchRays(el);
				break;
		}
	})
}