'use strict';

var path   = require('path')
, generators = require('yeoman-generator');

var ClassGenerator = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    
    this.desc('Generate Reliable Stateful Service application template');
    this.option('libPath', {
      type: String
      , required: true
    });
    this.option('isAddNewService', {
      type: Boolean
      , required: true
    });
    this.libPath = this.options.libPath;
    this.isAddNewService = this.options.isAddNewService;
  
  },
  
  prompting: function () {
    var done = this.async();
    var utility = require('../utility');
    var prompts = [{
      type: 'input'
      , name: 'serviceFQN'
      , message: 'Enter the name of Reliable Stateful Service : '
      , validate: function (input) {
        return input ? utility.validateFQN(input) : false;
      }
    }];
    
    this.prompt(prompts, function(input) {
      this.serviceFQN = input.serviceFQN;
      var parts = this.serviceFQN.split('.')
      , name  = parts.pop();
      this.packageName = parts.join('.');
      this.dir = parts.join('/');
      this.reliableServiceName = utility.capitalizeFirstLetter(name.trim());
      this.serviceFQN = (!this.packageName ? "" : this.packageName + ".") + this.reliableServiceName;
      if (!this.packageName) {
        this.packageName = "statefulservice";
        this.serviceFQN = "statefulservice." + this.serviceFQN;
        this.dir = this.dir + "/statefulservice";
      }
      done();
    }.bind(this));
  },
  
  initializing: function () {
    this.props = this.config.getAll();
    this.config.defaults({
      author: '<your name>'
    });
  },
  
  writing: function () {
    var appPackage = this.props.projName;
    var servicePackage = this.reliableServiceName + 'Pkg';
    var serviceProjName = this.reliableServiceName;

    if (this.reliableServiceName.endsWith('Service')==true || this.reliableServiceName.endsWith('service')==true) {
      var serviceRunnerName = this.reliableServiceName + 'Host';
      var serviceClassName = this.reliableServiceName;
      var serviceMainClassFQN =  this.serviceFQN + 'Host';
      var serviceTypeName = this.reliableServiceName + 'Type';
      var serviceName = this.reliableServiceName;      
    } else {
      var serviceRunnerName = this.reliableServiceName + 'ServiceHost';
      var serviceClassName = this.reliableServiceName + 'Service';      
      var serviceMainClassFQN =  this.serviceFQN + 'ServiceHost';
      var serviceTypeName = this.reliableServiceName + 'ServiceType';
      var serviceName = this.reliableServiceName + 'Service';      
    }

    var appName = this.props.projName;
    var appTypeName = this.props.projName + 'Type';
   
    var appPackagePath = this.isAddNewService == false ? path.join(this.props.projName, appPackage) :  appPackage;
    var serviceSrcPath = this.isAddNewService == false ? path.join(this.props.projName, serviceProjName) : serviceProjName ;
    var serviceJarName = (this.reliableServiceName).toLowerCase();

    var is_Windows = (process.platform == 'win32');

    var sdkScriptExtension;
    
    if (is_Windows)
    {
      sdkScriptExtension = '.ps1';
    }
    else {
      sdkScriptExtension = '.sh';
    }
    
    this.fs.copyTpl(
      this.templatePath('class/Service.java'),
      this.destinationPath(path.join(serviceSrcPath, 'src', this.dir, serviceClassName + '.java')),
      {
        packageName: this.packageName,
        serviceClassName: serviceClassName
      } 
    );
    
    this.fs.copyTpl(
      this.templatePath('class/ServiceRunner.java'),
      this.destinationPath(path.join(serviceSrcPath, 'src', this.dir, serviceRunnerName + '.java')),
      {
        packageName: this.packageName,
        serviceClassName: serviceClassName,
        serviceRunnerName: serviceRunnerName,
        serviceTypeName: serviceTypeName
      } 
    );
    
  
    this.fs.copyTpl(
      this.templatePath('gradle/build.gradle'),
      this.destinationPath(path.join(serviceSrcPath, 'build.gradle')),
      {
        libPath: this.libPath,
        appPackage: appPackage,
        servicePackage: servicePackage,
        serviceMainClass: serviceMainClassFQN,
        serviceJarName: serviceJarName
      } 
    );
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('gradle/build2.gradle'),
        this.destinationPath(path.join(this.props.projName, 'build.gradle')),
        {
          libPath: this.libPath,
          appPackage: appPackage,
          servicePackage: servicePackage
        } 
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('gradle/settings.gradle'),
        this.destinationPath(path.join(this.props.projName, 'settings.gradle')),
        {
          serviceProjName: serviceProjName
        } 
      );
    } else {
	  var nodeFs = require('fs');
      var appendToSettings = "\ninclude \'" + serviceProjName + "\'";
      nodeFs.appendFile(path.join(this.destinationRoot(), 'settings.gradle'), appendToSettings, function (err) {
         if(err) {
              return console.log(err);
          }
      });
    }
    
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('app/appPackage/ApplicationManifest.xml'),
        this.destinationPath(path.join(appPackagePath, 'ApplicationManifest.xml')),
        {
          appTypeName: appTypeName,
          appName: this.reliableServiceName,
          servicePackage: servicePackage,
          serviceName: serviceName,
          serviceTypeName: serviceTypeName
        } 
      );
    } else {
      var fs = require('fs'); 
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser();
      fs.readFile(path.join(appPackagePath, 'ApplicationManifest.xml'), function(err, data) {
      parser.parseString(data, function (err, result) {
          if (err) {
              return console.log(err);
          }
          result['ApplicationManifest']['ServiceManifestImport'][result['ApplicationManifest']['ServiceManifestImport'].length] = 
          {"ServiceManifestRef":[{"$":{"ServiceManifestName":servicePackage,"ServiceManifestVersion":"1.0.0"}}]}
          result['ApplicationManifest']['DefaultServices'][0]['Service'][result['ApplicationManifest']['DefaultServices'][0]['Service'].length] = 
          {"$":{"Name":serviceName},"StatefulService":[{"$":{"ServiceTypeName":serviceTypeName,"TargetReplicaSetSize":"3","MinReplicaSetSize":"3"},"UniformInt64Partition":[{"$":{"PartitionCount":"1","LowKey":"-9223372036854775808","HighKey":"9223372036854775807"}}]}]}; 

          var builder = new xml2js.Builder();
          var xml = builder.buildObject(result);
          fs.writeFile(path.join(appPackagePath, 'ApplicationManifest.xml'), xml, function(err) {
            if(err) {
                return console.log(err);
            }
          }); 
        });
      });
    }
    this.fs.copyTpl(
      this.templatePath('app/appPackage/servicePackage/ServiceManifest.xml'),
      this.destinationPath(path.join(appPackagePath, servicePackage, 'ServiceManifest.xml')),
      {
        serviceManifestName: servicePackage,
        serviceName: serviceName,
        serviceTypeName: serviceTypeName
      } 
    );
    
    this.fs.copyTpl(
      this.templatePath('app/appPackage/servicePackage/Code/entryPoint.sh'),
      this.destinationPath(path.join(appPackagePath, servicePackage, 'Code', 'entryPoint.sh')),
      {
        serviceJarName: serviceJarName
      } 
    );
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('deploy/install'+sdkScriptExtension),
        this.destinationPath(path.join(this.props.projName, 'install'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName,
          serviceName: serviceName,
          serviceTypeName: serviceTypeName
        } 
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('deploy/uninstall'+sdkScriptExtension),
        this.destinationPath(path.join(this.props.projName, 'uninstall'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName,
          serviceName: serviceName,
          serviceTypeName: serviceTypeName
        } 
      );
    }
    this.template('app/appPackage/servicePackage/Code/_readme.txt', path.join(appPackagePath, servicePackage, 'Code', '_readme.txt'));
    this.template('app/appPackage/servicePackage/Config/_readme.txt', path.join(appPackagePath, servicePackage, 'Config', '_readme.txt'));
    this.template('app/appPackage/servicePackage/Config/Settings.xml', path.join(appPackagePath, servicePackage, 'Config', 'Settings.xml'));
    this.template('app/appPackage/servicePackage/Data/_readme.txt', path.join(appPackagePath, servicePackage, 'Data', '_readme.txt'));
  } 
});

module.exports = ClassGenerator;
