class User extends Model {
    constructor(data) {
        super({
            id: '',
            name: ''
        });

        this.fill(data);
    }
}

class Users extends Cache {
    constructor() {
        super({
            model: [ User ],
            key: 'users',
            channel: 'local'
        });
    }

    static updateName(id, name) {
        // update some stuff
    }
}

class Thing extends React.Component {
    render() {
        const users = this.props.users.map((u) => {
            return (
                <li>{ u.name }</li>
            );
        });

        return (
            <ul>
                { users }
            </ul>
        );
    }
}

function connect(maps) {
    return (component) => {
    };
}

export connect({
    users: new Users(),
    userIds: {
        cache: new Users(),
        update: (users) => users.map((u) => u.id)
    },
    updateName: Users.updateName
})(Thing);


