using DBI_Project_2024_25.Models;
using Microsoft.EntityFrameworkCore;

namespace DBI_Project_2024_25.Infrastructure;

public class TierDbContext : MongoDbContext
{
    public TierDbContext(DbContextOptions<TierDbContext> options) : base(options)
    {
    }

    public DbSet<Tier> Tiere { get; set; }
    public DbSet<Filiale> Filialen { get; set; }
    public DbSet<TierFiliale> TierFilialen { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Tier entity
        modelBuilder.Entity<Tier>(entity =>
        {
            entity.HasKey(t => t.Name); // Using Name as the primary key
            entity.Property(t => t.Name).IsRequired();
            entity.Property(t => t.Groesse).IsRequired();
            entity.Property(t => t.Gewicht).IsRequired().HasColumnType("decimal(18,2)");
        });

        // Configure Filiale entity
        modelBuilder.Entity<Filiale>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Name).IsRequired();
            entity.Property(f => f.Adresse).IsRequired();
        });

        // Configure TierFiliale entity (junction table)
        modelBuilder.Entity<TierFiliale>(entity =>
        {
            entity.HasKey(tf => new { tf.FilialeId, tf.TierName });

            entity.HasOne<Filiale>()
                .WithMany(f => f.TierFilialen)
                .HasForeignKey(tf => tf.FilialeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<Tier>()
                .WithMany(t => t.TierFilialen)
                .HasForeignKey(tf => tf.TierName)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(tf => tf.Anzahl).IsRequired();
        });
    }
}