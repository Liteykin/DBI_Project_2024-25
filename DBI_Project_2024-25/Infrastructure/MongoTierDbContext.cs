using Microsoft.EntityFrameworkCore;

namespace DBI_Project_2024_25.Infrastructure {
    public class MongoTierDbContext : TierDbContext {
        public MongoTierDbContext(DbContextOptions<TierDbContext> options) : base(options) {}
    }
}
