import React from 'react';
import ReactDOM from 'react-dom';
import initialData from './initial-data'
import Column from "./column";
import '@atlaskit/css-reset'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import styled from 'styled-components'

const Container = styled.div`
  display:flex;
`
class InnerList extends React.PureComponent {
  // shouldComponentUpdate(nextProps) {
  //   if(nextProps.column === this.props.column && nextProps.taskMap === this.props.taskMap && nextProps.index === this.props.index) {
  //     return false;
  //   }
  //   return true;
  // }

  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId])
    return <Column column={column} tasks={tasks} index={index} />
  }
}

class App extends React.Component {
  state = initialData

  onDragStart = (start, provided) => {
    provided.announce(
      `You have lifted the task in position ${start.source.index + 1}`,
    );
    const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId)
    this.setState({
      homeIndex
    })
  }

  onDragUpdate = (update, provided) => {
    const message = update.destination
      ? `You have moved the task to position ${update.destination.index + 1}`
      : `You are currently not over a droppable area`;

    provided.announce(message);
  }

  onDragEnd = (result, provided) => {
    const message = result.destination
      ? `You have moved the task from position
        ${result.source.index + 1} to ${result.destination.index + 1}`
      : `The task has been returned to its starting position of
        ${result.source.index + 1}`;

    provided.announce(message);
    this.setState({
      homeIndex: null
    })

    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(this.state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder
      }

      this.setState(newState)
      return;
    }

    const columnStart = this.state.columns[source.droppableId];
    const columnFinish = this.state.columns[destination.droppableId];

    if (columnStart === columnFinish) {
      const newTaskIds = Array.from(columnStart.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = {
        ...columnStart,
        taskIds: newTaskIds
      };
      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn
        }
      }
      this.setState(newState)
      return
    }
    const startTaskIds = Array.from(columnStart.taskIds);
    startTaskIds.splice(source.index, 1);
    const newColumnStart = {
      ...columnStart,
      taskIds: startTaskIds
    }

    const finishTaskIds = Array.from(columnFinish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newColumnFinish = {
      ...columnFinish,
      taskIds: finishTaskIds
    }

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newColumnStart.id]: newColumnStart,
        [newColumnFinish.id]: newColumnFinish
      }
    }
    this.setState(newState)
  }

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <Container
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {this.state.columnOrder.map((columnId, index) => {
                // const isDropDisabled = index < this.state.homeIndex;
                const column = this.state.columns[columnId];
                // const tasks = column.taskIds.map(
                //   taskId => this.state.tasks[taskId]
                // )
                return (
                  <InnerList
                    key={column.id}
                    index={index}
                    column={column}
                    taskMap={this.state.tasks}
                  // isDropDisabled={isDropDisabled} 
                  />
                )
              })}
              {provided.placeholder}
            </Container>)}

        </Droppable>
      </DragDropContext>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
