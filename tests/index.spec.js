﻿'use strict';
describe('nuget-pckg', function () {
	
	var Ng = require('../nuget-pckg.js'),
		fse = require('fs-extra'),
		fs = require('fs');
	
	describe('getNuspecs', function () {

		it('should list nuspec files', function (done) {
			//Arrange
			var ng = new Ng({
				baseDir: './tests'
			});

		    var d = [];

			ng.getNuspecs({ }).on('data', function(data) {
				d.push(data);
			}).on('end', function () {
				expect(d).toEqual([
					'c:\\_dev\\nuget-pack\\tests\\proj1\\proj1.nuspec',
					'c:\\_dev\\nuget-pack\\tests\\proj2\\proj2.nuspec'
				]);
			    done();
			});
		});
	});
	
	describe('pack', function () {
		it('should create nuget package with specified nuspec file', function (done) {
		    //Arrange
		    var expectedPackage = './tests/publishFolder/Proj1.1.0.0.nupkg';
		    var ng = new Ng({
				baseDir: './tests'
			});
			//Act
			ng.pack({
				outputDirectory: './tests/publishFolder',
				spec: './tests/proj1/proj1.nuspec'
			}, function () {
				//Assert
			    var created = fs.existsSync(expectedPackage);
			    expect(created).toBeTruthy();
			    done();
			});
		});
		
		it('should create nuget package with specified nuspec file - in a stream', function (done) {
		    //Arrange
		    var expectedPackage = './tests/publishFolder/Proj1.1.0.0.nupkg';
		    var ng = new Ng({
				baseDir: './tests'
			});
			var d = [];

			//Act
			ng.getNuspecs({
				skip: ['proj2']
			}).pipe(ng.pack({
				outputDirectory: './tests/publishFolder'
			})).on('data', function(data) {
				d.push(data);
			}).on('end', function () {
				//Assert
			    var created = fs.existsSync(expectedPackage);
				expect(created).toBeTruthy();
			    expect(d[0]).toEqual('tests\\publishFolder\\Proj1.1.0.0.nupkg');
			    done();
			});
		});

	});
	
	describe('add', function () {
		
		it('should add single nuget package to folder structure', function (done) {
			//Arrange
			var expectedPackage = [
				'./tests/server/proj1/1.0.0/proj1.1.0.0.nupkg',
				'./tests/server/proj1/1.0.0/proj1.1.0.0.nupkg.sha512',
				'./tests/server/proj1/1.0.0/proj1.nuspec'
			];

			var ng = new Ng({
				baseDir: './tests'
			});
			//Act
		    ng.add({
				nupkg: './tests/packed/Proj1.1.0.0.nupkg',
				source: './tests/server/'
			}, function () {
				//Assert
		        expectedPackage.forEach(function (e) {
					var created = fs.existsSync(e);
					expect(created).toBeTruthy();
				});
		        done();
		    });
		});
		
		it('should add single nuget package to folder structure - in a stream', function (done) {
			//Arrange
			var expectedPackage = [
				'./tests/server/proj1/1.0.0/proj1.1.0.0.nupkg',
				'./tests/server/proj1/1.0.0/proj1.1.0.0.nupkg.sha512',
				'./tests/server/proj1/1.0.0/proj1.nuspec'
			];

			var ng = new Ng({
				baseDir: './tests'				
			});
			//Act
			ng.getNuspecs({
				skip: ['proj2']
			})
			.pipe(ng.pack({
				outputDirectory: './tests/publishFolder',
			}))
			.pipe(ng.add({
				source: './tests/server/'
			})).on('end', function () {
				//Assert
				expectedPackage.forEach(function (e) {
					var created = fs.existsSync(e);
					expect(created).toBeTruthy();
				});
				done();
			});
		});
	});

    afterEach(function() {
		fse.removeSync('./tests/publishFolder');		
		fse.removeSync('./tests/server');
    });
});