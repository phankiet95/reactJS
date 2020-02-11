import React from 'react'
import './style.scss';

const TaskPanel = ({taskPanel, children, handleAddTask}) => {
	return (
		<div className="TaskPanel card">
			<div className="TaskPanel__header card-header">
				<span className="badge badge-success TaskPanel__task-count">{taskPanel.get('tasks').size} Task</span>
				<span className="TaskPanel__title" >{taskPanel.get('title')}</span>
				<button className="btn btn-primary btn-success" onClick={handleAddTask}><span className="glyphicon glyphicon-plus"></span>New</button>
			</div>
			<div className="TaskPanel__content">
				{children}
			</div>
		</div>
	);
};

export default TaskPanel;