'use strict';

const async = require('async');
module.exports = (app) => {
    app.models.Team.count({}, (error, count) => {
        if (error) {
            throw error;
        }
        if (count) {
            return;
        }
        addData();
    });

    const addData = () => {
        async.parallel({
            users: async.apply(createUser),
            teams: async.apply(createTeam)
        }, (err, results) => {
            if (err)
                throw err;

            roleAssign(results.users, (err) => {
                console.log('> Role Assigned sucessfully');
            })

            cerateMember(results.teams, (err) => {
                console.log('> models created sucessfully');
            });
        });
    };

    const createUser = (cb) => {
        const User = app.models.User;
        User.create([
            {
                "username": "first",
                "email": "first@demo.com",
                "password": "123",
                "emailVerified": true
            },
            {
                "username": "second",
                "email": "second@demo.com",
                "password": "123",
                "emailVerified": true
            }
        ], cb);
    }

    const roleAssign = (user, cb) => {
        const Role = app.models.Role;
        const RoleMapping = app.models.RoleMapping;

        //create the admin role
        Role.create({
            name: 'admin'
        }, function (err, role) {
            if (err) cb(err);
            role.principals.create({
                principalType: RoleMapping.USER,
                principalId: user[0].id
            }, function (err, principal) {
                cb(err);
            });
        });
    }

    const createTeam = (cb) => {
        const Team = app.models.Team;
        Team.create([
            {
                'name': 'Team 1',
                'area': 'area 1',
                'pincode': '123456',
                'policeStation': 'ps1',
            },
            {
                'name': 'Team 2',
                'area': 'area 2',
                'pincode': '654321',
                'policeStation': 'ps2',
            },
        ], cb);
    }

    const cerateMember = (team, cb) => {
        const Member = app.models.Member;
        Member.create([
            {
                'firstName': 'one',
                'lastName': 'demo',
                'mobile': 987456,
                'email': 'one@demo.com',
                'address': 'test1',
                'teamId': team[0].id,
            },
            {
                'firstName': 'two',
                'lastName': 'demo',
                'mobile': 123456,
                'email': 'two@demo.com',
                'address': 'test2',
                'teamId': team[0].id,
            },
            {
                'firstName': 'three',
                'lastName': 'demo',
                'mobile': 34567,
                'email': 'three@demo.com',
                'address': 'test3',
                'teamId': team[1].id,
            },
        ], cb);
    }
};

