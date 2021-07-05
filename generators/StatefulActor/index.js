'use strict';

var path   = require('path')
, Generator = require('yeoman-generator');

var ClassGenerator = class extends Generator({
  constructor: function () {
    generators.Base.apply(this, arguments);
    
    this.desc('Generate Reliable actor application template');
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
      , name: 'actorFQN'
      , message: 'Enter the name of actor service : '
      , validate: function (input) {
        return input ? utility.validateFQN(input) : false;
      }
    }];
    
    this.prompt(prompts, function(input) {
      this.actorFQN = input.actorFQN;
      var parts = this.actorFQN.split('.')
      , name  = parts.pop();
      this.packageName = parts.join('.');
      this.dir = parts.join('/');
      this.actorName = utility.capitalizeFirstLetter(name.trim());
      this.actorFQN = (!this.packageName ? "" : this.packageName + ".") + this.actorName; 
      if (!this.packageName) {
        this.packageName = "reliableactor";
        this.actorFQN = "reliableactor." + this.actorFQN;
        this.dir = this.dir + "/reliableactor";
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
    var interfaceProjName = this.actorName + 'Interface';
    var serviceProjName = this.actorName;
    var testClientProjName = this.actorName + 'TestClient';
    
    var appPackage = this.props.projName;
    var servicePackage = this.actorName + 'Pkg';
    var serviceName = this.actorName + 'Service';
    var serviceTypeName = this.actorName + 'ServiceType';
    var appTypeName = this.props.projName + 'Type';
    var appName = this.props.projName;
    
    var serviceJarName = (this.actorName).toLowerCase();
    var interfaceJarName = (this.actorName + '-interface').toLowerCase();
    var testClientJarName = (this.actorName + '-test').toLowerCase();
    
    var testClassName = this.actorName + 'TestClient';
    var serviceMainClass = this.actorName.toUpperCase().endsWith('ACTOR') ? this.actorName + 'Host' : this.actorName + 'ActorHost';
    var endpoint = serviceName + 'Endpoint';
    var replicatorEndpoint = serviceName + 'ReplicatorEndpoint';
    var replicatorConfig = serviceName + 'ReplicatorConfig';
    var replicatorSecurityConfig = serviceName + 'ReplicatorSecurityConfig';
    var localStoreConfig = serviceName + 'LocalStoreConfig';
 
    var appPackagePath = this.isAddNewService == false ? path.join(this.props.projName, appPackage) :  appPackage;
    var serviceSrcPath = this.isAddNewService == false ? path.join(this.props.projName, serviceProjName) : serviceProjName ;
    var interfaceSrcPath = this.isAddNewService == false ? path.join(this.props.projName, interfaceProjName) : interfaceProjName;
    var testClientSrcPath = this.isAddNewService == false ? path.join(this.props.projName, testClientProjName) : testClientProjName;

    var is_Windows = (process.platform == 'win32');
    var is_Linux = (process.platform == 'linux');
    var is_mac = (process.platform == 'darwin');

    var sdkScriptExtension;
    
    if (is_Windows)
    {
      sdkScriptExtension = '.ps1';
    }
    else {
      sdkScriptExtension = '.sh';
    }

    this.fs.copyTpl(
      this.templatePath('service/class/ActorImpl.java'),
      this.destinationPath(path.join(serviceSrcPath , 'src', this.dir, this.actorName + 'Impl.java')),
      {
        actorName: this.actorName,
        packageName: this.packageName,
        serviceName: serviceName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/Service.java'),
      this.destinationPath(path.join(serviceSrcPath , 'src', this.dir, serviceMainClass + '.java')),
      {
        actorName: this.actorName,
        packageName: this.packageName,
        serviceClassName: serviceMainClass
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/gradle/build.gradle'),
      this.destinationPath(path.join(serviceSrcPath, 'build.gradle')),
      {
        libPath: this.libPath,
        serviceJarName: serviceJarName,
        serviceMainClass: this.packageName ? (this.packageName + '.' + serviceMainClass) : serviceMainClass,
        appPackage: appPackage,
        servicePackage: servicePackage,
        interfaceProjName: interfaceProjName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/app/appPackage/servicePackage/ServiceManifest.xml'),
      this.destinationPath(path.join(appPackagePath, servicePackage, 'ServiceManifest.xml')),
      {
        servicePackage: servicePackage,
        serviceTypeName: serviceTypeName,
        endpoint: endpoint,
        replicatorEndpoint: replicatorEndpoint
      } 
    );
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('service/app/appPackage/ApplicationManifest.xml'),
        this.destinationPath(path.join(appPackagePath, 'ApplicationManifest.xml')),
        {
          appTypeName: appTypeName,
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
      this.templatePath('service/app/appPackage/servicePackage/Code/entryPoint.sh'),
      this.destinationPath(path.join(appPackagePath, servicePackage, 'Code', 'entryPoint.sh')),
      {
        serviceJarName: serviceJarName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/app/appPackage/servicePackage/Config/Settings.xml'),
      this.destinationPath(path.join(appPackagePath, servicePackage, 'Config', 'Settings.xml')),
      {
        replicatorConfig: replicatorConfig,
        replicatorEndpoint: replicatorEndpoint,
        replicatorSecurityConfig: replicatorSecurityConfig,
        localStoreConfig: localStoreConfig
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/gradle/settings.gradle'),
      this.destinationPath(path.join(serviceSrcPath , 'settings.gradle')),
      {
        interfaceProjName: interfaceProjName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('interface/interface/ActorInterface.java'),
      this.destinationPath(path.join(interfaceSrcPath , 'src', this.dir, this.actorName + '.java')),
      {
        actorName: this.actorName,
        packageName: this.packageName,
        authorName: this.props.authorName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('interface/gradle/build.gradle'),
      this.destinationPath(path.join(interfaceSrcPath, 'build.gradle')),
      {
        libPath: this.libPath,
        interfaceJarName: interfaceJarName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('testclient/class/TestClient.java'),
      this.destinationPath(path.join(testClientSrcPath , 'src', this.dir, 'test', testClassName + '.java')),
      {
        actorName: this.actorName,
        packageName: this.packageName ? this.packageName + '.test' : 'test' ,
        actorFQN: this.actorFQN,
        serviceName: serviceName,
        appName: appName,
        testClassName: testClassName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('testclient/gradle/build.gradle'),
      this.destinationPath(path.join(testClientSrcPath, 'build.gradle')),
      {
        libPath: this.libPath,
        testClientJarName: testClientJarName,
        interfaceProjName: interfaceProjName,
        testClassFQN: (this.packageName ? this.packageName + '.test' : 'test') + '.' + testClassName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('testclient/testscripts/testclient.sh'),
      this.destinationPath(path.join(testClientSrcPath, 'testclient.sh')),
      {
        testJar: testClientJarName,
        fabricCodePath: (is_mac ? "/home/FabricDrop/bin/Fabric/Fabric.Code" : "/opt/microsoft/servicefabric/bin/Fabric/Fabric.Code/")
      } 
    );
    
    this.fs.copyTpl(
      this.templatePath('testclient/gradle/settings.gradle'),
      this.destinationPath(path.join(testClientSrcPath , 'settings.gradle')),
      {
        interfaceProjName: interfaceProjName
      } 
    );
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/gradle/build.gradle'), 
        this.destinationPath(path.join(this.props.projName, 'build.gradle')),
        {
          appPackage: appPackage,
          servicePackage: servicePackage,
          libPath: this.libPath,
          interfaceProjName: interfaceProjName
        
        }
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/gradle/settings.gradle'),
        this.destinationPath(path.join(this.props.projName, 'settings.gradle')),
        {
          interfaceProjName: interfaceProjName,
          serviceProjName: serviceProjName,
          testClientProjName: testClientProjName
        } 
      );
    } else {
	  var nodeFs = require('fs');
      var appendToSettings = "\ninclude \'" + interfaceProjName + "\',\'" + testClientProjName + "\',\'" + serviceProjName + "\'";
      nodeFs.appendFile(path.join(this.destinationRoot(), 'settings.gradle'), appendToSettings, function (err) {
         if(err) {
              return console.log(err);
          }
      });
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/install'+sdkScriptExtension),
        this.destinationPath(path.join(this.props.projName, 'install'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/upgrade'+sdkScriptExtension),
        this.destinationPath(path.join(this.props.projName, 'upgrade'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName
        } 
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/uninstall'+sdkScriptExtension),
        this.destinationPath(path.join(this.props.projName, 'uninstall'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }
    
    this.template('service/app/appPackage/servicePackage/Code/_readme.txt', path.join(appPackagePath, servicePackage, 'Code', '_readme.txt'));
    this.template('service/app/appPackage/servicePackage/Config/_readme.txt', path.join(appPackagePath, servicePackage, 'Config', '_readme.txt'));
    this.template('service/app/appPackage/servicePackage/Data/_readme.txt', path.join(appPackagePath, servicePackage, 'Data', '_readme.txt'));
  } 
});

module.exports = ClassGenerator;
