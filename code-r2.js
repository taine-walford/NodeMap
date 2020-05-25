let globalDoc,
    docHeight,
    docWidth,
    nHigh,
    nWide,
    c,
    ctx,
    centerToCorner
let nodeArray = [],
    lastRender = 0,
    avgPerf = [],
    paused = false,
    nodeArrayLength = [],
    returnNeighboursDebug = [],
    distortionFloat
const nodeCount = 400,
    maxSpeed = 90,
    nodeRadius = 80,
    nodeSize = 2,
    darkLineColour = 'rgb(15, 26, 36)',
    distortionAmount = 1.5,
    highlightRange = 1.6


window.onload = () => {
    globalDoc = document.body

    let html = document.documentElement

    docHeight = Math.max(globalDoc.scrollHeight, globalDoc.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    docWidth = Math.max(globalDoc.scrollWidth, globalDoc.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)
    centerToCorner = Math.hypot(docWidth / 2, docHeight / 2)
    centerX = docWidth / 2
    centerY = docHeight / 2

    darkCanvas = document.getElementById("canvas");
    darkCanvas.height = docHeight
    darkCanvas.width = docWidth
    darkCtx = darkCanvas.getContext("2d");
    medCanvas = document.getElementById("canvas");
    medCanvas.height = docHeight
    medCanvas.width = docWidth
    medCtx = medCanvas.getContext("2d");
    nodeCanvas = document.getElementById("canvas");
    nodeCanvas.height = docHeight
    nodeCanvas.width = docWidth
    nodeCtx = nodeCanvas.getContext("2d");
    createNodes()
    window.requestAnimationFrame(gameLoop)
}

function gameLoop(timestamp) {
    var progress = timestamp - lastRender
    avgPerf.push(progress)
    if (avgPerf.length === 20) {
        avgPerf = avgPerf.reduce((a, b) => a + b) / 50
        console.clear()
        console.log("Frametime:", avgPerf)
        avgPerf = []
    }
    updateNodes(progress)
    sortNodesByX()
    drawNodes()

    lastRender = timestamp
    if (!paused) window.requestAnimationFrame(gameLoop)
}

function updateNodes(progress) {
    for (let nodeIndex in nodeArray) {
        firstNode = nodeArray[nodeIndex]
        firstNode.x += (firstNode.xSpeed * (progress / 1000))
        firstNode.y += (firstNode.ySpeed * (progress / 1000))
        if (firstNode.x + 10 < 0) firstNode.x += docWidth + 10
        if (firstNode.y + 10 < 0) firstNode.y += docHeight + 10
        if (firstNode.x - 10 > docWidth) firstNode.x = -10
        if (firstNode.y - 10 > docHeight) firstNode.y = -10
    }
}

function returnNeighbours(index, area) {
    let indexStart, indexEnd
    index = Number(index)
    indexStart = (index - area <= 0) ? 0 : index - area
    indexEnd = (index + area >= nodeArray.length - 1) ? nodeArray.length - 1 : index + area
    let slice = nodeArray.slice(indexStart, indexEnd)
    returnNeighboursDebug.push(index, area, "|", indexStart, indexEnd, slice.length, "|||")
    return slice
}

function sortNodesByX() {
    let arr = [...nodeArray]
    arr.sort((a, b) => (a.x > b.x) ? 1 : -1)
}

function drawNodes() {
    darkCtx.clearRect(0, 0, docWidth, docHeight)
    medCtx.clearRect(0, 0, docWidth, docHeight)
    nodeCtx.clearRect(0, 0, docWidth, docHeight)

    nodeCtx.globalAlpha = 1
    nodeCtx.globalCompositeOperation = 'normal'

    darkCtx.beginPath()
    darkCtx.strokeStyle = darkLineColour
    let nodeIndex, nodeArrLen
    for (nodeIndex = 0, nodeArrLen = nodeArray.length; nodeIndex < nodeArrLen; nodeIndex++) {
        currentNode = nodeArray[nodeIndex]
        let nearXNodes = nodeArray.filter(filterNode => filterNode.x > currentNode.x - nodeRadius && filterNode.x < currentNode.x + nodeRadius)

        for (let nearXNodeIndex = 0, nearXNodesLength = nearXNodes.length; nearXNodeIndex < nearXNodesLength; nearXNodeIndex++) {
            if (nearXNodes[nearXNodeIndex].y > currentNode.y - nodeRadius && nearXNodes[nearXNodeIndex].y < currentNode.y + nodeRadius) {
                drawBetween(currentNode, nearXNodes[nearXNodeIndex], darkCtx)
            }
        }
    }
    darkCtx.stroke()

    medCtx.beginPath()
    medCtx.strokeStyle = 'rgb(255, 0, 0)'
    for (nodeIndex = 0, nodeArrLen = nodeArray.length; nodeIndex < nodeArrLen; nodeIndex++) {
        currentNode = nodeArray[nodeIndex]
        let nearXNodes = nodeArray.filter(filterNode => filterNode.x > currentNode.x - (nodeRadius / highlightRange) && filterNode.x < currentNode.x + (nodeRadius / highlightRange))

        for (let nearXNodeIndex = 0, nearXNodesLength = nearXNodes.length; nearXNodeIndex < nearXNodesLength; nearXNodeIndex++) {
            if (nearXNodes[nearXNodeIndex].y > currentNode.y - (nodeRadius / highlightRange) && nearXNodes[nearXNodeIndex].y < currentNode.y + (nodeRadius / highlightRange)) {
                drawBetween(currentNode, nearXNodes[nearXNodeIndex], medCtx)
            }
        }
    }
    medCtx.stroke()

    nodeCtx.globalAlpha = 0.8
    nodeCtx.globalCompositeOperation = 'screen'

    medCtx.beginPath()
    medCtx.strokeStyle = 'rgb(0, 255, 255)'
    for (nodeIndex = 0, nodeArrLen = nodeArray.length; nodeIndex < nodeArrLen; nodeIndex++) {
        currentNode = nodeArray[nodeIndex]
        let nearXNodes = nodeArray.filter(filterNode => filterNode.x > currentNode.x - (nodeRadius / highlightRange) && filterNode.x < currentNode.x + (nodeRadius / highlightRange))

        for (let nearXNodeIndex = 0, nearXNodesLength = nearXNodes.length; nearXNodeIndex < nearXNodesLength; nearXNodeIndex++) {
            if (nearXNodes[nearXNodeIndex].y > currentNode.y - (nodeRadius / highlightRange) && nearXNodes[nearXNodeIndex].y < currentNode.y + (nodeRadius / highlightRange)) {
                drawDistortedBetween(currentNode, nearXNodes[nearXNodeIndex], medCtx)
            }
        }
    }
    medCtx.stroke()

    nodeCtx.beginPath()
    nodeCtx.fillStyle = 'rgb(0, 255, 255)'
    for (let node in nodeArray) {
        node = nodeArray[node]
        drawCircle(distortion(node.x, node.y), nodeCtx)
    }
    nodeCtx.fill()
    nodeCtx.beginPath()
    nodeCtx.fillStyle = 'rgb(255, 0, 0)'
    for (let node in nodeArray) {
        node = nodeArray[node]
        drawCircle([node.x, node.y], nodeCtx)
    }
    nodeCtx.fill()
}

function distortion(x, y) {
    if (x < centerX) distortionFloat = -((centerX - x) / centerX)
    else distortionFloat = ((x - centerX) / centerX)
    return [x + (distortionAmount * distortionFloat), y + (distortionAmount * distortionFloat)]
}

function drawDistortedBetween(first, second, context) {
    first = distortion(first.x, first.y)
    second = distortion(second.x, second.y)
    context.moveTo(first[0], first[1])
    context.lineTo(second[0], second[1])
}

function drawBetween(first, second, context) {
    context.moveTo(first.x, first.y)
    context.lineTo(second.x, second.y)
}

function createNodes() {
    let nodes,
        x,
        y
    for (nodes = 0; nodes < nodeCount; nodes++) {
        x = getRandom(docWidth)
        y = getRandom(docHeight)
        let initialXSpeed = getRandom(maxSpeed)
        let xSpeed = getRandom(2) === 0 ? 0 - initialXSpeed : initialXSpeed
        let initialYSpeed = getRandom(maxSpeed)
        let ySpeed = getRandom(2) === 0 ? 0 - initialYSpeed : initialYSpeed
        nodeArray.push({ x, y, xSpeed, ySpeed })
    }
}

function drawCircle(arr, context) {
    context.moveTo(arr[0], arr[1])
    context.arc(arr[0], arr[1], nodeSize, 0, 2 * Math.PI);
}



function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomRange(low, high) {
    let diff = high - low
    return low + Math.floor(Math.random() * Math.floor(diff))
}

function hexShift(colour, value) {
    value = value || 1
    colour = hexToRGBArr(colour)
    for (let x in colour) {
        if (value > 1) colour[x] += (255 * (value - 1))
        else colour[x] -= (255 * (1 - value))
    }
    let lColour =
        'rgb(' + colour[0] +
        ',' + colour[1] +
        ',' + colour[2] +
        ')'
    return lColour
}

function hexToRGBArr(h) {
    let r = 0,
        g = 0,
        b = 0;
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }
    return [parseInt(r), parseInt(g), parseInt(b)];
}