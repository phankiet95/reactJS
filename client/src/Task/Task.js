import React from 'react'
import './style.scss';
import { Draggable } from 'react-beautiful-dnd';

const task = (props) => {
  return (
    <Draggable draggableId={props.task.get('id')} index={props.index}>
    {
      provided => (
        <div className="Task"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
        {
          props.isEditing ?
          <div className="Task__editing">
            <input type="text" className="Task__editor" defaultValue={props.task.get('content')} onChange={props.handleChangeTempEditingContent} />
              <div className="Task__editing-action">
                <button className="btn btn-outline-success" onClick={props.handleSaveEdit}>Save</button>
                <button className="btn btn-outline-danger" onClick={props.handleCancelEdit}>No</button>
              </div>
          </div>
          : 
          <div className="Task__main">
            <span className="Task__content">{props.task.get('content')}</span>
            <div className="Task__action">
              <button className="btn btn-outline-success" onClick={props.handleChooseEditTask}><i className="far fa-edit"></i></button>
              <button className="btn btn-outline-success" onClick={props.handleDelTask}><i className="far fa-trash-alt"></i></button>
            </div>
          </div>
        }
        </div>
      )
    }
    </Draggable>
  )
}

export default task;