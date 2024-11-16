using System.Diagnostics;
using Bogus;
using DBI_Project_2024_25.Models;
using DBI_Project_2024_25.Models.MongoModels;

namespace DBI_Project_2024_25.Infrastructure;

public class SeedingService
{
    private const int SEED = 1245899876;

    public Stopwatch stopwatch = new();

    public SeedingService() {}

    public List<Tier> GenerateTiere(int count)
    {
        return GenerateTiere(count, 0);
    }

    public List<Filiale> GenerateFilialen(int count)
    {
        return GenerateFilialen(count, 0);
    }

    public List<MongoFiliale> GenerateFilialenMongo(int count, ICollection<MongoTier> tiere) {
        return GenerateFilialenMongo(count, 0, tiere);
    }

    public List<Tier> GenerateTiere(int count, int shift)
    {
        count = Math.Min(100, count);

        var names = new HashSet<string>();
        var nameFaker = new Faker();

        for (var i = 0; i < count; i++)
        {
            string name;
            do
            {
                name = nameFaker.Lorem.Word();
            } while (!names.Add(name));
        }

        var nameList = names.ToList();

        var faker = new Faker<Tier>()
            .RuleFor(t => t.Name, f => nameList[f.IndexFaker])
            .RuleFor(t => t.Gewicht, f => f.Random.Number(1000) / 10)
            .RuleFor(t => t.Groesse, f => f.Random.Number(1000) / 10);

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<MongoTier> GenerateTiereMongo(int count, int anzahl) {
        count = Math.Min(100, count);

        var names = new HashSet<string>();
        var nameFaker = new Faker();

        for (var i = 0; i < count; i++) {
            string name;
            do {
                name = nameFaker.Lorem.Word();
            } while (!names.Add(name));
        }

        var nameList = names.ToList();

        var faker = new Faker<MongoTier>()
            .RuleFor(t => t.Name, f => nameList[f.IndexFaker])
            .RuleFor(t => t.Gewicht, f => f.Random.Number(1000) / 10)
            .RuleFor(t => t.Groesse, f => f.Random.Number(1000) / 10)
            .RuleFor(t => t.Anzahl, f => f.Random.Number(anzahl));

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<Filiale> GenerateFilialen(int count, int shift)
    {
        count = Math.Min(100, count);

        var id = shift + 1;
        var faker = new Faker<Filiale>()
            .RuleFor(f => f.Id, f => id++)
            .RuleFor(f => f.Name, f => f.Company.CompanyName())
            .RuleFor(f => f.Adresse, f => f.Address.StreetAddress());

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<MongoFiliale> GenerateFilialenMongo(int count, int shift, ICollection<MongoTier> tiere) {
        count = Math.Min(100, count);

        var id = shift + 1;
        var faker = new Faker<MongoFiliale>()
            .RuleFor("Id", f => GenerateHex())
            .RuleFor(f => f.Name, f => f.Company.CompanyName())
            .RuleFor(f => f.Adresse, f => f.Address.StreetAddress())
            .RuleFor(f => f.Tiere, tiere);

        faker.UseSeed(SEED);

        return faker.Generate(count);
    }

    public List<TierFiliale> GenerateTierFilialen(List<Filiale> filialen, List<Tier> tiere, int count, int anzahl)
    {
        // Failsafe
        count = Math.Min(filialen.Count * tiere.Count, count);

        var faker = new Faker<TierFiliale>()
            .RuleFor(tf => tf.FilialeId, f => f.PickRandom(filialen).Id)
            .RuleFor(tf => tf.TierName, f => f.PickRandom(tiere).Name)
            .RuleFor(tf => tf.Anzahl, f => f.Random.Number(anzahl) + 1);

        faker.UseSeed(SEED);

        var result = new List<TierFiliale>();
        var combinations = new HashSet<string>();
        string currentCombination;

        for (var i = 0; i < count; i++)
        {
            TierFiliale generated;

            do
            {
                generated = faker.Generate();
                currentCombination = generated.FilialeId + generated.TierName;
            } while (!combinations.Add(currentCombination));

            result.Add(generated);
        }

        return result;
    }

    public void Seed(TierDbContext db, int tierCount, int filialeCount, int tierFilialeCount, int tierFilialeAnzahl)
    {

        var filialen = GenerateFilialen(filialeCount);
        var tiere = GenerateTiere(tierCount);
        var tierfilialen = GenerateTierFilialen(filialen, tiere, tierFilialeCount, tierFilialeAnzahl);

        stopwatch.Start();

        db.Filialen.AddRange(filialen);
        db.SaveChanges();

        db.Tiere.AddRange(tiere);
        db.SaveChanges();

        db.TierFilialen.AddRange(tierfilialen);
        db.SaveChanges();

        stopwatch.Stop();
    }

    public void SeedMongo(MongoTierDbContext db, int tierCount, int filialeCount, int tierFilialeAnzahl) {

        var tiere = GenerateTiereMongo(tierCount, tierFilialeAnzahl);
        var filialen = GenerateFilialenMongo(filialeCount, tiere);

        stopwatch.Start();

        db.Filialen.AddRange(filialen);
        db.SaveChanges();

        stopwatch.Stop();
    }

    private static string GenerateHex() {
        // Generate a 24 character hex string by replacing any non-hex character
        // with a valid hexadecimal digit
        var validHex = "0123456789abcdef";
        var random = new Random(SEED);
        string result = DateTime.Now.Ticks.ToString();

        while (result.Length < 24) {
            result += validHex[random.Next(validHex.Length)];
        }

        return result;
    }
}