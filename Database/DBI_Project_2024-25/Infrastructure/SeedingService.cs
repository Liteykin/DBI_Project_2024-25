using System.Diagnostics;
using Bogus;
using DBI_Project_2024_25.Models;

namespace DBI_Project_2024_25.Infrastructure;

public class SeedingService
{
    private const int SEED = 1245899876;

    public Stopwatch stopwatch = new();

    public List<Tier> GenerateTiere(int count)
    {
        var faker = new Faker<Tier>()
            .RuleFor(t => t.Name, f => f.Lorem.Word() + f.IndexFaker)
            .RuleFor(t => t.Gewicht, f => f.Random.Number(100))
            .RuleFor(t => t.Groesse, f => f.Random.Number(100));

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<MongoTier> GenerateTiereMongo(int count, long idShift)
    {
        var id = idShift;
        var faker = new Faker<MongoTier>()
            .RuleFor(t => t.Name, f => f.Lorem.Word() + id++)
            .RuleFor(t => t.Gewicht, f => f.Random.Number(100))
            .RuleFor(t => t.Groesse, f => f.Random.Number(100))
            .RuleFor(t => t.Anzahl, f => f.Random.Number(100) + 1);

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<Filiale> GenerateFilialen(int count)
    {
        var faker = new Faker<Filiale>()
            .RuleFor(f => f.Id, f => f.IndexFaker + 1)
            .RuleFor(f => f.Name, f => f.Company.CompanyName() + f.IndexFaker)
            .RuleFor(f => f.Adresse, f => f.Address.StreetAddress());

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<MongoFiliale> GenerateFilialenMongo(int count, int tiereProFiliale)
    {
        var faker = new Faker<MongoFiliale>()
            .RuleFor("Id", f => GenerateHex())
            .RuleFor(f => f.Name, f => f.Company.CompanyName() + f.IndexFaker)
            .RuleFor(f => f.Adresse, f => f.Address.StreetAddress())
            .RuleFor(f => f.Tiere, f => GenerateTiereMongo(tiereProFiliale, f.IndexFaker * tiereProFiliale));

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<TierFiliale> GenerateTierFilialen(List<Filiale> filialen, List<Tier> tiere, int count)
    {
        // Failsafe
        count = Math.Min(filialen.Count * tiere.Count, count);

        var allowedIndecies = Enumerable.Range(0, filialen.Count).ToList();

        var faker = new Faker<TierFiliale>()
            .RuleFor(tf => tf.FilialeId, f =>
            {
                var index = f.PickRandom(allowedIndecies);
                allowedIndecies.Remove(index);
                return filialen[index].Id;
            })
            .RuleFor(tf => tf.TierName, f => f.PickRandom(tiere).Name)
            .RuleFor(tf => tf.Anzahl, f => f.Random.Number(100) + 1);

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public void Seed(TierDbContext db, int tierCount, int filialeCount, int tierFilialeCount)
    {
        db.Filialen.RemoveRange(db.Filialen);
        db.Tiere.RemoveRange(db.Tiere);
        db.TierFilialen.RemoveRange(db.TierFilialen);
        db.SaveChanges();

        var filialen = GenerateFilialen(filialeCount);
        var tiere = GenerateTiere(tierCount);
        var tierfilialen = GenerateTierFilialen(filialen, tiere, tierFilialeCount);

        stopwatch.Start();

        db.Filialen.AddRange(filialen);
        db.SaveChanges();

        db.Tiere.AddRange(tiere);
        db.SaveChanges();

        db.TierFilialen.AddRange(tierfilialen);
        db.SaveChanges();

        stopwatch.Stop();
    }

    public void SeedMongo(MongoTierDbContext db, int filialeCount, int tiereProFiliale)
    {
        db.Filialen.RemoveRange(db.Filialen);
        db.SaveChanges();

        var filialen = GenerateFilialenMongo(filialeCount, tiereProFiliale);

        stopwatch.Start();

        db.Filialen.AddRange(filialen);
        db.SaveChanges();

        stopwatch.Stop();
    }

    private static string GenerateHex()
    {
        // Generate a 24 character hex string by replacing any non-hex character
        // with a valid hexadecimal digit
        var validHex = "0123456789abcdef";
        var random = new Random(SEED);
        var result = DateTime.Now.Ticks.ToString();

        while (result.Length < 24) result += validHex[random.Next(validHex.Length)];

        return result;
    }
}