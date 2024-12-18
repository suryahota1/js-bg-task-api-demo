const progressElement = document.getElementById("progress-bar");
const taskTextElement = document.getElementById("task-status");
const taskDetailElement = document.getElementById("task-details");
const templateElement = document.getElementById("box-template");
const startTaskButtonElement = document.getElementById("task-btn");
const indicatorElement = document.getElementById("task-execution-indicator");

let totalTaskCount = 0, executedTaskCount = 0, isFetchingTasks = false, pageNum = 0, taskQueue = [];

let taskSchedulerId, viewRefreshId;
let taskFragment = null;

function toggleAriaBusy () {
    const busyValue = taskDetailElement.getAttribute("aria-busy") === "true";
    taskDetailElement.setAttribute("aria-busy", !busyValue);
}

function updateViewWhileFetchingTasks () {
    startTaskButtonElement.toggleAttribute("disabled");
    startTaskButtonElement.innerText = "Fetching more tasks";
}

function updateViewAfterFetchingTasks () {
    startTaskButtonElement.toggleAttribute("disabled");
    startTaskButtonElement.innerText = "Start task";
}

function scheduleViewRefresh () {
    if ( !viewRefreshId ) {
        viewRefreshId = requestAnimationFrame(updateView);
    }
}

function scheduleTaskExecution () {
    if ( !taskSchedulerId ) {
        taskSchedulerId = requestIdleCallback(executeTask);
    }
}

function updateProgressElement () {
    const currMax = Number(progressElement.getAttribute("max"));
    if ( Number.isNaN(currMax) || currMax < totalTaskCount ) {
        progressElement.setAttribute("max", totalTaskCount);
    }

    const currValue = Number(progressElement.getAttribute("value"));
    if ( Number.isNaN(currValue) || currValue < executedTaskCount ) {
        progressElement.setAttribute("value", executedTaskCount);
    }
}

function updateTaskTextElement () {
    if ( totalTaskCount === 0 ) {
        taskTextElement.innerText = "No tasks available";
    } else {
        taskTextElement.innerText = "Finished working " + executedTaskCount + " tasks of " + totalTaskCount + " tasks";
    }
}

function updateDetails () {
    if ( taskFragment ) {
        taskDetailElement.appendChild(taskFragment);
        taskFragment = null;
    }
}

function updateView () {
    // Indicate that content is getting updated
    toggleAriaBusy();
    updateProgressElement();
    updateTaskTextElement();
    updateDetails();
    // Indicate that content update finished
    toggleAriaBusy();
    viewRefreshId = null;
}

function executeTask ( deadline ) {
    indicatorElement.classList.remove("pause");
    indicatorElement.classList.add("resume");
    taskSchedulerId = null;
    console.log("deadline", deadline);
    while ( (deadline.timeRemaining() > 0 || deadline.didTimeout) && taskQueue.length > 0 ) {
        const currentTask = taskQueue.shift();
        taskHandler(currentTask);
        executedTaskCount++;
    }
    if ( taskQueue.length > 0 ) {
        scheduleTaskExecution();
    }
    scheduleViewRefresh();
    indicatorElement.classList.add("pause");
    indicatorElement.classList.remove("resume");
}

function enqueTask ( taksInfo ) {
    totalTaskCount += taksInfo.taskCount;
    for ( let i = 0; i < taksInfo.taskCount; i++ ) {
        taskQueue.push({
            pageNum, 
            taskNum: i + 1
        });
    }
    scheduleTaskExecution();
    scheduleViewRefresh();
}

function taskHandler ( task ) {
    // do something
    for ( let i = 0; i < 2; i++ ) {
        // dummy loop to do things synchronously
    }
    if ( !taskFragment ) {
        taskFragment = document.createDocumentFragment();
    }

    const templateNode = templateElement.content.cloneNode(true);
    templateNode.querySelector(".box-header-text").innerText = "Page " + task.pageNum;
    templateNode.querySelector(".box-body-text").innerText = "Task " + task.taskNum;

    taskFragment.appendChild(templateNode);
}
function getTaskInfo () {
    return new Promise(( resolve ) => {
        const randomTimer = 500 + Math.ceil(Math.random() * 1000);
        setTimeout(() => {
            const taskCount = 10000 + Math.ceil(Math.random() * 10000);
            resolve({
                taskCount
            });
        }, randomTimer);
    });
}

async function startTask () {
    pageNum++;
    updateViewWhileFetchingTasks();
    const taksInfo = await getTaskInfo();
    enqueTask(taksInfo);
    updateViewAfterFetchingTasks();
    // Asynchronously fetch how many tasks to perform
    // User is not blocked on adding tasks while other tasks are getting executed
    // what task to perform is already defined on the client
    // UI should not be blocked or there should not be any lag while executing tasks
    // User should be able to scroll or perform any other task smoothly
}

document.getElementById("task-btn").addEventListener("click", startTask, false);

// To demostrate main thread high priority work 
setInterval(() => {
    for ( let i = 0; i < 100; i++ ) {

    }
}, 100);
