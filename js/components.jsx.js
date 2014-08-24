/** @jsx React.DOM */

function isEnterKeyPressed(evt) {
    return evt.nativeEvent.keyCode === 13;
}

var TodoItem = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getDefaultProps: function() {
        return {
            item: {
                isComplete: false,
                label: ''
            }
        };
    },
    buildState: function(item) {
        return {
            isComplete: item.isComplete,
            label: item.label,
            isEditing: false
        };
    },
    getInitialState: function() {
        return this.buildState(this.props.item);
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(this.buildState(nextProps.item));
    },
    handleToggle: function(evt) {
        Todo.toggle(this.props.item, evt.target.checked);
    },
    handleEdit: function(evt) {
        this.setState({
            isEditing: true,
            editValue: this.state.label
        });
        return false;
    },
    handleValue: function(evt) {
        if (isEnterKeyPressed(evt)) {
            // this.setState({
            //     isEditing: false,
            //     label: this.state.editValue
            // });
            Todo.edit(this.props.item.key, this.state.editValue);
        }
    },
    handleDestroy: function() {
        Todo.remove(this.props.item);
    },
    render: function() {
        var classes = [];
        if (this.state.isComplete) {
            classes.push('completed');
        }
        if (this.state.isEditing) {
            classes.push('editing');
        }
        return (
            <li className={classes.join(' ')} onDoubleClick={this.handleEdit}>
                <div className="view">
                    <input className="toggle" type="checkbox" checked={this.state.isComplete} onChange={this.handleToggle} />
                    <label>{this.state.label}</label>
                    <button className="destroy" onClick={this.handleDestroy}></button>
                </div>
                <input className="edit" valueLink={this.linkState('editValue') } onKeyPress={this.handleValue} />
            </li>
        );
    }
});

var TodoList = React.createClass({
    getDefaultProps: function() {
        return {
            list: []
        };
    },
    asTodoItem: function(item) {
        return (
            <TodoItem item={item} key={item.key}/>
        );
    },
    render: function() {
        return (
            <ul id="todo-list">
                { this.props.list.map(this.asTodoItem) }
            </ul>
        );
    }
});

var TodoMain = React.createClass({
    getInitialState: function() {
        return {
            hide: false
        };
    },
    getDefaultProps: function() {
        return {
            list: []
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            hide: nextProps.list.length < 1
        });
    },
    toggleAll: function(evt) {
        Todo.toggleAll(evt.target.checked);
    },
    render: function() {
        return (
            <section id="main" className={this.state.hide ? "hidden" : ""}>
                <input id="toggle-all" type="checkbox" onChange={this.toggleAll} />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <TodoList list={this.props.list} />
            </section>
        );
    }
});

var TodoHeader = React.createClass({
    addTodo: function(evt) {
        if (isEnterKeyPressed(evt)) { // enter key pressed
            Todo.add(evt.target.value);
            evt.target.value = '';
        }
    },
    render: function() {
        return (
            <header id="header">
                <h1>todos</h1>
                <input id="new-todo" placeholder="What needs to be done?" autoFocus onKeyPress={this.addTodo}/>
            </header>
        );
    }
});

var TodoFooter = React.createClass({
    getDefaultProps: function() {
        return {
            list: []
        };
    },
    getInitialState: function() {
        return {
            completedCount: 0,
            hideClearButton: false,
            isHidden: true
        };
    },
    componentWillReceiveProps: function(nextProps) {
        var all = nextProps.list.length,
            complete = _.reduce(nextProps.list, function(count, item) {
                return item.isComplete ? count + 1 : count;
            }, 0),
            incomplete = all - complete;
        this.setState({
            completedCount: complete,
            hideClearButton: complete < 1,
            count: incomplete,
            isHidden: all < 1
        });
    },
    clearCompleted: function() {
        Todo.clearCompleted();
    },
    render: function() {
        var completedLabel = "Clear completed (" + this.state.completedCount + ")",
            clearButtonClass = this.state.hideClearButton ? "hidden" : "";
        return (
            <footer id="footer" className={this.state.isHidden ? "hidden" : ""}>
                <span id="todo-count"><strong>{this.state.count}</strong>{ this.state.count > 1 ? " items left" : " item left"}</span>
                {
                // Remove this if you don't implement routing
                // <ul id="filters">
                //     <li>
                //         <a class="selected" href="#/">All</a>
                //     </li>
                //     <li>
                //         <a href="#/active">Active</a>
                //     </li>
                //     <li>
                //         <a href="#/completed">Completed</a>
                //     </li>
                // </ul>
                }
                <button id="clear-completed" className={clearButtonClass} onClick={this.clearCompleted}>{completedLabel}</button>
            </footer>
        );
    }
});

var TodoApp = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function() {
        return {
            list: []
        };
    },
    componentDidMount: function() {
        this.listenTo(todoListStore, this.listChanged, this.listChanged);
    },
    listChanged: function(todoList) {
        this.setState({
            list: todoList
        });
    },
    render: function() {
        return (
            <div>
                <TodoHeader />
                <TodoMain list={this.state.list} />
                <TodoFooter list={this.state.list} />
            </div>
        );
    }
});

React.renderComponent(new TodoApp({}), document.getElementById('todoapp'));