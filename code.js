//pushing test
let globalDoc,
    docHeight,
    docWidth,
    nHigh,
    nWide,
    c,
    ctx,
    allNodes = [],
    completedNodes = [],
    linecounter = 0,
    buttonPressed = true

const shardSize = 100


window.onload = () => {
    globalDoc = document.body

    let html = document.documentElement

    docHeight = Math.max(globalDoc.scrollHeight, globalDoc.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    docWidth = Math.max(globalDoc.scrollWidth, globalDoc.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)

    let inj = globalDoc.getElementsByClassName('injector')[0]
    console.log(docHeight, docWidth)

    console.log(Math.round(docWidth / shardSize))
    console.log(docWidth - shardSize)
    console.log((docWidth - shardSize) / shardSize)

    placeNodes(inj)
    let allRows = globalDoc.getElementsByClassName('row'),
        currentNodes
    console.log(allRows)
    for (let row in allRows) {
        if (allRows[row].className === 'row') {
            currentNodes = allRows[row].getElementsByClassName('node')
            allNodes.push(...currentNodes)
        }
    }
    counter = 0
    currentNode = allNodes[0]
    while (allNodes.length > 0) {
        if (buttonPressed === false) continue
        else {
            buttonPressed = false
            let x = Number(currentNode.dataset.x)
            let y = Number(currentNode.dataset.y)
            let nearArr = getAdjacentNodes(x, y)
            let affectedNodes = connectRandom(nearArr, currentNode)
            allNodes.splice(allNodes.indexOf(affectedNodes[0]), 1)
            currentNode = affectedNodes[1]
            console.log(...affectedNodes)
            counter++
        }

    }
    console.log(counter, linecounter)
}

function connectRandom(nearArr, rootNode) {
    let rootNodeCoord = getXY(rootNode)
    let randomNode = nearArr.splice(newRandom(nearArr.length - 1, 1))[0]
    let randNodeCoord = getXY(randomNode)
    drawLine(rootNodeCoord, randNodeCoord)
    linecounter++
    return [rootNode, randomNode]
}

function placeNodes(parent) {
    let fieldWidth = Math.floor(docWidth - shardSize)
    nWide = Math.floor(fieldWidth / shardSize) + 1
    let fieldXSpacer = fieldWidth / nWide

    let fieldHeight = Math.floor(docHeight - shardSize)
    nHigh = Math.floor(fieldHeight / shardSize) + 1
    let fieldYSpacer = fieldHeight / nHigh

    let cleanMargin = shardSize / 2
    parent.style.top = cleanMargin
    parent.style.left = cleanMargin

    c = document.getElementById("canvas");
    c.style.margin = cleanMargin - 5
    c.height = fieldHeight + 10
    c.width = fieldWidth + 10
    ctx = c.getContext("2d");

    for (let y = 0; y <= nHigh; y++) {
        let row = document.createElement("div")
        row.className = 'row'
        row.style.top = (y * fieldYSpacer)
        for (let x = 0; x <= nWide; x++) {
            let node = document.createElement("div")
            node.className = 'node'
            node.style.marginTop = -5
            node.dataset.x = x
            node.dataset.y = y
            node.style.marginLeft = (x * fieldXSpacer) - 5
            row.appendChild(node)
        }
        parent.appendChild(row)
    }
}

function getAdjacentNodes(nodeX, nodeY) {
    let rowArr = globalDoc.getElementsByClassName('row')
    let nearRows = [],
        nearNodes = []
    if (nodeY > 0) nearRows.push(rowArr[nodeY - 1]);
    nearRows.push(rowArr[nodeY])
    if (nodeY < nHigh) nearRows.push(rowArr[nodeY + 1])
    for (let y in nearRows) {
        nearRows[y] = nearRows[y].getElementsByClassName('node')
        if (nodeX > 0) nearNodes.push(nearRows[y][nodeX - 1])
        nearNodes.push(nearRows[y][nodeX])
        if (nodeX < nHigh) nearNodes.push(nearRows[y][nodeX + 1])
    }
    return nearNodes
}

// function getPartners(nodeArr, nodeX, nodeY) {
//     let rootNode
//     for (let node in allNodes) {
//         if (allNodes[node].dataset.x == nodeX && allNodes[node].dataset.y == nodeY) rootNode = allNodes[node]
//     }
//     for (let node in nodeArr) {
//         if (nodeArr[node] === rootNode) nodeArr.splice(node, 1)
//     }
//     firstNode = nodeArr.splice(newRandom(nodeArr.length - 1), 1)[0]
//     secondNode = nodeArr.splice(newRandom(nodeArr.length - 1), 1)[0]
//     thirdNode = nodeArr.splice(newRandom(nodeArr.length - 1), 1)[0]
//     console.log([rootNode, firstNode, secondNode, thirdNode])
//     return [rootNode, firstNode, secondNode, thirdNode]
// }

function connectNodes(arr) {
    drawLine(getXY(arr[0]), getXY(arr[1]))
    drawLine(getXY(arr[0]), getXY(arr[2]))
    drawLine(getXY(arr[0]), getXY(arr[3]))
}

function getXY(div) {
    let offsets = div.getBoundingClientRect()
    let y = offsets.top;
    let x = offsets.left;
    return [x - (shardSize / 2) + 10, y - (shardSize / 2) + 10]
}

function drawLine(firstCoord, secondCoord) {
    x1 = firstCoord[0]
    y1 = firstCoord[1]
    x2 = secondCoord[0]
    y2 = secondCoord[1]
    ctx.beginPath();
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 3
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function newRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// console.log(nearNodes[i])
// var top = offsets.top;
// var left = offsets.left;