export type TaskFunction = () => Promise<void>;

export async function executeTasksWithMaxConcurrency(taskFunctionArray:TaskFunction[], maxConcurrency:number) {
  let remainingToCompleteCount = taskFunctionArray.length;
  const taskFunctions:TaskFunction[] = [...taskFunctionArray];
  return new Promise<void>((resolve, reject) => {
    function _startNextTask(taskFunction:TaskFunction) {
      taskFunction().then(() => {
        if (--remainingToCompleteCount === 0) { resolve(); return; }
        if (taskFunctions && taskFunctions.length) {
          const nextTaskFunction = taskFunctions.pop();
          if (nextTaskFunction) _startNextTask(nextTaskFunction);
        }
      }).catch((err:any) => reject(err)); 
    }
    
    // Start first batch of concurrent tasks.
    const firstBatchCount = Math.min(maxConcurrency, taskFunctionArray.length);
    for(let i = 0; i < firstBatchCount; ++i) { 
      const nextTaskFunction = taskFunctions.pop();
      if (nextTaskFunction) _startNextTask(nextTaskFunction);
    }
  }).catch((err) => { throw err; });
}