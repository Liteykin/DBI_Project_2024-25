using DBI_Project_2024_25.Models;
using DBI_Project_2024_25.Models.MongoModels;
using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;

namespace DBI_Project_2024_25.Infrastructure {
    public class MongoTierDbContext : DbContext {
        public MongoTierDbContext(DbContextOptions<MongoTierDbContext> options) : base(options) {
            Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        }

        public DbSet<MongoFiliale> Filialen { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<MongoFiliale>().ToCollection("filialen");
        }
    }
}
