'use strict';

module.exports = (Member) => {
  Member.observe('before save', (ctx, next) => {
    const Team = Member.app.models.Team;
    console.log('ctx: ', ctx);
    if (ctx.isNewInstance) {
      console.log('Team id >>> ', ctx.instance.teamId);
      const query = {
        where: {
          id: ctx.instance.teamId,
        },
      };
      Team.find(query, (error, success) => {
        if (error) {
          console.log('error >>>', error);
          return;
        }
        if (!success) {
          throw 'No data found';
          return;
        }
        console.log('Team found >>> ', success);
      });
    }
    next();
  });
};
