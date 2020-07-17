'use strict';

var path = require('path');
var yosay = require('yosay');
const Generator = require('yeoman-generator');

var JavaGenerator = class extends Generator{
    constructor(args, opts) {
        super(args, opts);

        this.desc('Generate Service Fabric java app template');
        var chalk = require('chalk');
        if (this.config.get('projName')) {
            console.log(chalk.green("Setting project name to", this.config.get('projName')));
        } else {
            var err = chalk.red("Project name not found in .yo-rc.json. Exiting ..."); 
            throw err;
        }
    }

    async prompting() {

        var prompts = [{
            type: 'list', 
            name: 'frameworkType', 
            message: 'Choose a framework for your service', 
            default: this.config.get('frameworkType')
            , choices: ["Reliable Actor Service", "Reliable Stateless Service", "Reliable Stateful Service"]
            }];

        await this.prompt(prompts).then(props=>{
            this.props = props;
            this.config.set(props);
        });
    }

    writing() {
        var libPath = "REPLACE_SFLIBSPATH";
        var isAddNewService = true; 
        if (this.props.frameworkType == "Reliable Actor Service") {
            this.composeWith('azuresfjava:StatefulActor', {
            options: { libPath: libPath, isAddNewService: isAddNewService }
        });
        } else if (this.props.frameworkType == "Reliable Stateless Service") {
            this.composeWith('azuresfjava:ReliableStatelessService', {
            options: { libPath: libPath, isAddNewService: isAddNewService }
            });
        } else if (this.props.frameworkType == "Reliable Stateful Service") {
            this.composeWith('azuresfjava:ReliableStatefulService', {
                options: { libPath: libPath, isAddNewService: isAddNewService }
            });
        }
    }
    end() {
        this.config.save();
    }
};

module.exports = JavaGenerator;

