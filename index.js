const Cube = require('cano-cube');
const Router = require('koa-router');
const requireAll = require('require-all');
const map = require('lodash/map');
const path = require('path');

/**
  * @class RoutersCube
  * @classdesc This cube is for instance, load and bind routers to the cano app core
  * @extends Cube
  * @author Antonio Mejias
  */
class RoutersCube extends Cube {
    /**
     * @constructs
     * @author Antonio Mejias
     */
    constructor(cano, config = {mainPath: '/'}) {
        super(cano)
        this.config = config;
    }

    /**
     * @override
     * @method prepare
     * @description Ask if the cano.app.routers object exist, if not exist
     * the method create the proton.app.routers object
     * @author Antonio Mejias
     */
    prepare() {
        return new Promise((resolve) => {
            if (!this.cano.app.routers) this.cano.app.routers = {};
            resolve();
        })
    }

    /**
     * @override
     * @method up
     * @description This method run the cube routers main logic, in this case, instance
     * all the routers in the api folder and bind it to the cano app core
     * @author Antonio Mejias
     */
    up() {
        return new Promise((resolve) => {
            const requiredRouters = requireAll(this.routerPath)
            const groupRouter = new Router()

            map(requiredRouters, (router, fileName) => {
                this.bindToApp('routers', fileName, router)
                if (router && router.routes) groupRouter.use(router.routes())
            })
            this._bindToCano(groupRouter)
            resolve()
        })
    }

    _bindToCano(groupRouter) {
        const mainRouter = new Router()
        mainRouter.use(this.config.mainPath, groupRouter.routes())
        this.bindToCano(mainRouter.routes())
        this.bindToCano(mainRouter.allowedMethods())
    }

    /**
     * @method routerPath
     * @description This method is a getter that return the absolute path where the
     * routers are located
     * @author Antonio Mejias
     */
     get routerPath() {
         return path.join(this.cano.app.paths.api, '/routers')
     }
}

module.exports = RoutersCube;
