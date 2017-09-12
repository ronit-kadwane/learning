// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
    .module('app')
    .controller('TeamController', ['$scope', '$state', '$stateParams', 'Team', ($scope, $state, $stateParams, Team) => {
        $scope.teams = [];

        const getTeams = () => {
            Team
                .find()
                .$promise
                .then(function (results) {
                    $scope.teams = results;
                });
        }
        getTeams();

        $scope.addTeam = () => {
            console.log("New Teram>>>> ", $scope.newTeam);
            Team.create($scope.newTeam)
                .$promise
                .then(function (team) {
                    console.log("Team Created >>> ", team);
                    $scope.newTeam = '';
                    $('.focus').focus();
                    $state.go('teams');
                    getTeams();
                });
        }

        $scope.removeTeam = (team) => {
            Team
                .deleteById(team)
                .$promise
                .then(function () {
                    getTeams();
                });
        };

        $scope.listClick = (team) => {
            console.log("Clicked >>> ", team);
            $state.go('members', {
                "teamId": team.id
            });
        }

        $scope.teamUpdate = (team) => {
            console.log('Team Update >>> ', team);
            $state.go('editTeam', {
                team: JSON.stringify(team)
            });
        }
        $scope.initTeam = () => {
            console.log('team details >>> ', JSON.parse($stateParams.team));
            $scope.newTeam = JSON.parse($stateParams.team);
        }

        $scope.teamEdit = (editedTeam) => {
            const query = {
                where: {
                    id : editedTeam.id
                }
            }
            Team.update(query, editedTeam)
            .$promise
            .then((result) => {
                console.log('Record update >>> ');
                $scope.newTeam = '';
                    $('.focus').focus();
                    $state.go('teams');
                    getTeams();
            })
        }

        $scope.addTeamForm = () => {
            console.log("redirect to add team form");
            $state.go('addteam')
        }
    }]);
