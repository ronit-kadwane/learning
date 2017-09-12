// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
    .module('app')
    .controller('MemberController', ['$scope', '$state', '$stateParams', '$http', 'Member', ($scope, $state, $stateParams, $http, Member) => {
        $scope.teamId;
        $scope.members = [];

        $scope.memberInit = () => {
            console.log($stateParams);
            $scope.teamId = $stateParams.teamId;
            getMembers();
        }

        const getMembers = () => {
            const query = {
                filter: {
                    where: {
                        teamId: $scope.teamId
                    }
                }
            }
            Member
                .find(query)
                .$promise
                .then(function (results) {
                    $scope.members = results;
                });
        }

        $scope.addMember = () => {
            if ($scope.teamId) {
                $scope.newMember.teamId = $scope.teamId;
                Member.create($scope.newMember)
                    .$promise
                    .then(function (member) {
                        console.log("Member Created >>> ", member);
                        $scope.newMember = '';
                        $('.focus').focus();
                        getMembers();
                    });

                // $http({
                //     method: 'POST',
                //     url: 'http://localhost:3000/api/members',
                //     data: $scope.newMember
                // }).
                //     success(function (data, status, headers, config) {
                //         console.log("RESULT >>> ", data, status, headers, config);
                //         $scope.newMember = '';
                //     }).
                //     error(function (data, status, headers, config) {
                //         console.log("ERROR >>> ", data);
                //         $scope.newMember = '';
                //     });
            } else {
                console.error("TeamId cannot be empty");
            }
        }

        $scope.removeMember = (member) => {
            Member
                .deleteById(member)
                .$promise
                .then(function () {
                    getMembers();
                });
        };
        // $scope.listClick = (team) => {
        //     console.log("Clicked >>> ", team);
        //     $state.go('members',{
        //         "teamId": team.id
        //     });
        // }
    }]);
