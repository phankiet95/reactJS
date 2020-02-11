import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import { fromJS } from 'immutable';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import uuid from 'uuid/v1';


import TaskPanel from './TaskPanels/TaskPanel'
import Task from './Task/Task'

class App extends Component {

  constructor (props) {
    super(props);
    this.state = {
      currentTodolistId: null,
      editingTaskId: null,
      tempEditingContent: '',
      // taskPanels: fromJS([
      //   { id: 'toto', title: 'TO DO', tasks: fromJS([{id: 'task1', content: 'Đi mua thịt mèo'},{id: 'task2', content: 'Rán trứng'}])},
      //   { id: 'inprogress', title: 'IN PROGRESS', tasks: [] },
      //   { id: 'done', title: 'DONE', tasks: [] }
      // ]),
      taskPanels: [],
      todolist: []
    }
  };

  state = {
    message: ''
  };

  componentDidMount() {
    axios.get('/api/todolist')
         .then(res => {
            const result = res.data;
            this.setState({ todolist:result.todolist });
          })
         .catch(error => console.log(error));
  };

  handleUpdateData() {
    axios.post('/api/updateData', {
      id: this.state.currentTodolistId,
      todoListContent: JSON.stringify(this.state.taskPanels)
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleSelectTodolist = (todolistId) => {
    axios.post('/api/getData', {
      id: todolistId
    })
    .then(res => {
      const result = res.data;
      this.setState({ taskPanels:fromJS(JSON.parse(result.content[0].todoListContent)), currentTodolistId: todolistId});
      console.log(fromJS(JSON.parse(result.content[0].todoListContent)));
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleAddTask = (panelId) => {
    const {taskPanels} = this.state;
    const newTask = fromJS({id: uuid(), content: 'New Task'})
  
    // Get index of panel by selectedPanel
    const panelIndex = taskPanels.findIndex(panel => panel.get('id') === panelId);
  
    // Update this Panel by panelIndex in map
    const updatedPanel = taskPanels.updateIn([panelIndex, 'tasks'], tasks => tasks.push(newTask));
  
    this.setState({
      taskPanels : fromJS(updatedPanel)
    })
  }
  
  handleDelTask = (selectedPanel, selectedTask) =>{
    const result = window.confirm('Are your sure to delete this task?');
    if (result){
      const {taskPanels} = this.state;
  
      const updatedPanels = taskPanels.updateIn([selectedPanel, 'tasks'], tasks => tasks.remove(selectedTask));
  
      this.setState({
        taskPanels : fromJS(updatedPanels)
      }, () => {
        //toastr.success('Delete task success', 'Notice', { timeOut: 2000 });
        this.handleUpdateData();
      }
      )
    }
  }
  handleSaveDrag = (result) =>{
    const { source, destination, reason } = result;
    // source is task
    
    if (reason === 'DROP' && destination) {
      const { taskPanels } = this.state;
      
      // get [index] of source panel in taskPanels[] 
      const sourcePanelIndex = taskPanels.findIndex(panel => panel.get('id') === source.droppableId);
  
      //get task with [index] inside 'tasks' property. of taskPanel[sourcePanelIndex];
      const task = taskPanels.getIn([sourcePanelIndex, 'tasks', source.index]);
  
      // Delete task from source panel
      let updatedTaskPanels = taskPanels.updateIn(
        [sourcePanelIndex, 'tasks'],
        tasks => tasks.remove(source.index)
      );
  
      // Add task to destination panel
      const destinationPanelIndex = taskPanels.findIndex(panel => panel.get('id') === destination.droppableId);
      // Add to sepecific [index] position into destination panel
      updatedTaskPanels = updatedTaskPanels.updateIn(
        [destinationPanelIndex,'tasks'],
        tasks => tasks.insert(destination.index,task)
      );
      this.setState({
        taskPanels: fromJS(updatedTaskPanels)
      }, ()=>{this.handleUpdateData()});
    }
  }
  
  handleChooseEditTask = (taskId) => () => {
    console.log(taskId);
    this.setState({
        editingTaskId: taskId
    })
  }
  
  handleCancelEdit = () => {
    this.setState({
        editingTaskId: null,
        tempEditingContent: '',
    });
  }
  
  handleSaveEdit = (panelIndex, taskIndex) => {
    const {taskPanels, tempEditingContent} = this.state;
  
    const updatedPanels = taskPanels.updateIn([panelIndex, 'tasks'], tasks => tasks.setIn([taskIndex,'content'],tempEditingContent));
  
    this.setState({
      tempEditingContent :'',
      editingTaskId : null,
      taskPanels : fromJS(updatedPanels)
    }, ()=>{this.handleUpdateData()});
  }
  
  handleChangeTempEditingContent = (e) => this.setState({ tempEditingContent: e.target.value })

  render() {
    const { taskPanels, editingTaskId } = this.state;
    return(
      <div className="App">
      <h1 className="App__title" style={{margin:'20px'}}>Hello World, Hello React !</h1>

      <ul>
          {this.state.todolist.map(item => (
            <li key={item.id}>
              <h2 onClick={() => this.handleSelectTodolist(item.id)}>{item.todoListName}</h2>
            </li>
          ))}
      </ul>

      <DragDropContext onDragEnd={this.handleSaveDrag}>
        <div className="App__content" style={{display:'flex'}}>
          {
            taskPanels.map((taskPanel,taskPanelIndex) => (
              <TaskPanel key={taskPanel.get('id')} 
                taskPanel={taskPanel}
                handleAddTask ={() => this.handleAddTask(taskPanel.get('id'))}
                >
                <Droppable droppableId={taskPanel.get('id')}>{
                  provided => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps} style={{ minHeight: '300px' }}
                    >
                    {
                      taskPanel.get('tasks').map((task, taskIndex) => (
                        <Task key={task.get('id')} 
                          task={task} 
                          index={taskIndex}
                          handleDelTask ={() => this.handleDelTask(taskPanelIndex, taskIndex)}
                          isEditing={task.get('id') === editingTaskId}
                          handleChooseEditTask={this.handleChooseEditTask(task.get('id'))}
                          handleCancelEdit={this.handleCancelEdit}
                          handleSaveEdit={() => this.handleSaveEdit(taskPanelIndex, taskIndex)}
                          handleChangeTempEditingContent ={this.handleChangeTempEditingContent}
                        />
                      ))
                    }
                    {provided.placeholder}
                  </div>
                  )
                  }
                </Droppable>
              </TaskPanel>
            ))
          }
        </div>
      </DragDropContext>

    </div> 
    )
  };
};

export default App;
