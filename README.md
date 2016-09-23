# syme
> data layer tools for universal web apps

## Overview
This package takes the stance that data contracts should live on data instances and not on the interfaces that consume them. The impact of changes to these contracts is then easily audited by searching for instances of their definition, leading to easier to maintain code. The core of this system is the Model class. Model sets up a living data contract between frontend services, transforming and validating data, sending events on changes, and setting up rules for data hierarchy and initialization. Built on top of this are two helper classes. ModelListener is a wrapper around React.Component that takes over the duty of storing information on the view layer and keeps it in the model layer, setting up binding routes on the way. Any time a model updates, the view updates, and the view can send information to the model to allow it to modify the underlying data model. Setting all this up removes the siloing of data structure definition in the view (props) and allows that structure to be used in services, api calls, application logic, etc. Cache is an easy way to persist your data layer (whether it be in memory, local storage, or session storage) that also bundles up request contexts for you on the server, saving your site from making those extra api calls just to reload state.

__Table of Contents__
* [Model](#model)
  * [Usage](#model-usage)
  * [Hierarchy](#model-hierarchy)
  * [Inheritance](#model-inheritance)
  * [Transformation](#model-transformation)
* [ModelListener](#modellistener)
  * [Usage](#modellistener-usage)
  * [Binding](#modellistener-two)
* [Cache](#cache)
  * [Usage](#cache-usage)
  * [Server Side](#cache-serverside)

## <a name="model"></a>Model
<a name="model-usage"></a>Model has a simple interface, all documented in the source code, but sometimes examples are easier to parse. The most basic constructor looks like this:
```Javascript
class MyFirstModel extends Model {
    constructor(data) {
        super({
            id: 0,
            name: ''
        });

        this.fill(data);
    }
}
```
This example creates a model called `MyFirstModel` that defines it having the fields `id` and `name` with default values and hydrates based on it's constructor parameters.

### <a name="model-hierarchy"></a>hierarchy
You can add hierarchy to models by including the class name as a default parameter:
```Javascript
class Name extends Model {
    constructor(data) {
        super({
            first: '',
            last: ''
        });

        this.fill(data);
    }

    fullName() {
        return this.first + ' ' + this.last;
    }
}

class Permission extends Model {
    constructor(data) {
        super({
            id: 0,
            code: '',
            name: ''
        });

        this.fill(data);
    }
}

class AuthUser extends Model {
    constructor(data) {
        super({
            name: Name,
            perms: [ Permission ]
        });

        this.fill(data);
    }

    can(perm) {
        for (var i = 0; i < this.perms.length; i++) {
            if (this.perms[i].code === perm) {
                return true;
            }
        }

        return false;
    }
}

var MyAuth = new AuthUser({
    name: {
        first: 'super',
        last: 'dev'
    },
    perms: [{
        id: 12,
        code: 'delete',
        name: 'User can delete posts'
    }, {
        id: 64,
        code: 'edit',
        name: 'User can edit posts'
    }]
});

console.log(MyAuth.can('edit')); // outputs true
console.log(MyAuth.name.fullName()); // outputs 'super dev'
```

### <a name="model-inheritance"></a>inheritance
If you want to inherit from a model, you can use the `extend` function:
```Javascript
class Animal extends Model {
    constructor(data) {
        super({
            species: '',
            name: ''
        });

        this.fill(data);
    }
}

class LoudAnimal extends Animal {
    constructor(data) {
        super().extend({
            sound: '',
            level: 0
        });

        this.fill(data);
    }
}
```

### <a name="model-transformation"></a>transformation
Sometimes data doesn't always come in clean. Sometimes you want to represent your data differently inside of your application logic than outside. There are even times when you have to take a data format and tear it to a million pieces to make it work. You can do this by overwriting the model's `fill` function. The `out` function works exactly the same, but in reverse.
```Javascript
class MyFirstTransform extends Model {
    constructor(data) {
        super({
            name: '',
            itemCount: 0
        });

        this.fill(data);
    }

    fill(data) {
        if (!data) {
            return this;
        }

        if (data.hasOwnProperty('items')) {
            data.itemCount = data.items.length;
            delete data.items;
        }

        super.fill(data);
        return this;
    }
}
```

## <a name="modellistener"></a>ModelListener
<a name="modellistener-usage"></a>The point of the ModelListener is to be as transparent as possible. If you want to reuse your data layer across your application, you need only to extend from ModelListener instead of React.Component and pass that data contract as prop `model`. This will instantly send all model updates to the view using the model's internal dirty flag and rate limiter. Lets look at a simple example:
```Javascript
class MyComponent extends ModelListener {
    static defaultProps = {
        model: MyFirstModel
    };

    render() {
        return <div>{ this.model.name }</div>
    }
}

React.createElement(<MyComponent model={ { name: 'super dev' } } />);
```

### <a name="modellistener-two"></a>A two way street
The ModelListener also provides a way to update your model from the view through the update function. Here we are pumping the value from the input
field into the model's `name` field.
```Javascript
class MyComponent extends ModelListener {
    static defaultProps = {
        model: MyFirstModel
    };

    update(field, evt) {
        super.update(field, evt.target.value);
    }

    render() {
        return (
            <input defaultValue={ this.model.name }
                onChange={ this.update.bind(this, 'name') } />
        );
    }
}
```

## <a name="cache"></a>Cache
<a name="cache-usage"></a>A cache is used whenever you need a centralized place within your application to maintain data. As long as any two instances reference the same cache definition, they should be referencing the same data. There's some nice features in here like adding an expiration to the data and being able to subscribe to changes in the cache. To create a cache, just make a definition:
```Javascript
class MyCache extends Cache {
    constructor() {
        super({
            key: 'todos',
            channel: 'local',
            expiration: 5 * 60 * 1000
        });
    }
}
```

now, whenever you fetch data (say on a button click), just populate the cache:
```Javascript
function fetch() {
    return new Promise((fulfill, reject) => {
        const cache = new MyCache();

        if (cache.cached) {
            fulfill(cache.cached);
        }

        apiRequest('//url')
            .then(resp) {
                cache.populate(resp.data);

                fulfill(cache.cached);
            }
    });
}
```

and if you want something else in your application to keep in step with the changes to your cache:
```Javascript
class MyViewClass {
    constructor() {
        const cache = new MyCache();

        cache.watch((data) => {
            this.update(data);
        });
    }
}
```

You can define a cache as existing in memory (channel: 'memory'), localStorage (channel: 'local'), or sessionStorage (channel: 'session'). If the interface is not available for the code's environment, it rolls back in persistance until it hits the memory layer.

### <a name="cache-serverside"></a>Server Side Caches
Server side caches default to being in memory. You don't have to change any of your client side code for it to do this. They use a super sweet project called 'continuation-local-storage' to create a request focused namespace dedicated to your cache. To enable this, add middleware before you start building a request:
```Javascript
// in express
import { createNamespace } from 'continuation-local-storage';
import express from 'express';

const app = express();
app.use((req, resp, next) => {
    createNamespace('ServerState', () => {
        next();
    });
});

// the rest of your application
```

building the server's state is particularly nice with the `react-resolver` package as it's not bound to routes, which helps in reusability of components:
```Javascript
import { resolve } from 'react-resolver';

class MyComponent extends React.Component {
    render() {
        return <h1>{ this.props.model.name }</h1>
    }
}

export default resolve({
    model: () => {
        return new Promise((fulfill, reject) => {
            const cache = new MyCache();

            if (cache.cached) {
                fulfill(cache.cached);
            } else {
                apiRequest()
                    .then((resp) => {
                        cache.populate(resp.data);
                        fulfill(cache.cached);
                    });
            }
        });
    }
})(MyComponent);
```

follow that project's instructions for rendering on the server, and then make sure to output the server's state to the client so that no additional fetch is required to build the client state. You can do this by pumping the string rendered from `StorageController.out()` into an empty script tag on the page:
```Javascript
import StorageController from 'syme/dist/internal/storage-controller';

app.use((req, resp) => {
    match({
        routes: routes,
        location: req.url
    }, (error, redirectLocation, renderProps) => {
        Resolver
            .resolve(() => (
                <RouterContext { ...renderProps } />
            ))
            .then(({ Resolved }) => {
                resp.end(
                    [
                        '<!DOCTYPE html>',
                        '<html>',
                            '<head>',
                                `<script>${ StorageController.out() }</script>`,
                            '</head>',
                            '<body>',
                                '<div id="page">',
                                    React.renderToString(<Resolved />),
                                '</div>',
                            '</body>',
                        '</html>'
                    ].join('')
                );
            });
    });
});
```