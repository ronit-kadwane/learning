// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
    .module('app', ['lbServices', 'ui.router'])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '',
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            });

        $stateProvider
            .state('teams', {
                url: '/teams',
                templateUrl: 'views/teams.html',
                controller: 'TeamController'
            });

        $stateProvider
            .state('addteam', {
                url: '/addteam',
                templateUrl: 'views/addteam.html',
                controller: 'TeamController'
            });

        $stateProvider
            .state('editTeam', {
                url: '/addteam/:team',
                templateUrl: 'views/addteam.html',
                controller: 'TeamController'
            });

        $stateProvider
            .state('members', {
                url: '/members/:teamId',
                templateUrl: 'views/members.html',
                controller: 'MemberController'
            });

        $urlRouterProvider.otherwise('home');
    }]);
