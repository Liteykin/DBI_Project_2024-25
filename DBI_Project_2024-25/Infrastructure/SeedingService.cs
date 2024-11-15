using Bogus;
using DBI_Project_2024_25.Models;

namespace DBI_Project_2024_25.Infrastructure
{
    public class SeedingService {

        private TierDbContext _db;

        public SeedingService(TierDbContext db) {
            _db = db;
        }

        public List<Tier> GenerateTiere(int count) {
            return GenerateTiere(count, 0);
        }

        public List<Filiale> GenerateFilialen(int count) {
            return GenerateFilialen(count, 0);
        }

        public List<Tier> GenerateTiere(int count, int shift) {
            var names = new HashSet<string>();
            var nameFaker = new Faker();

            for (int i = 0; i < count; i++) {
                string name;
                do {
                    name = nameFaker.Lorem.Word();
                } while (!names.Add(name));
            }

            var nameList = names.ToList();

            var faker = new Faker<Tier>()
                .RuleFor(t => t.Name, f => nameList[f.IndexFaker])
                .RuleFor(t => t.Gewicht, f => f.Random.Number(1000) / 10)
                .RuleFor(t => t.Groesse, f => f.Random.Number(1000) / 10);

            return faker.Generate(count);
        }

        public List<Filiale> GenerateFilialen(int count, int shift) {
            var id = shift + 1;
            var faker = new Faker<Filiale>()
                .RuleFor(t => t.Id, f => id++)
                .RuleFor(t => t.Name, f => f.Company.CompanyName())
                .RuleFor(t => t.Adresse, f => f.Address.StreetAddress());

            return faker.Generate(count);
        }

        public List<TierFiliale> GenerateTierFilialen(List<Filiale> filialen, List<Tier> tiere, int count, int anzahl) {

            // Failsafe
            count = Math.Min(filialen.Count * tiere.Count, count);

            var faker = new Faker<TierFiliale>()
                            .RuleFor(tf => tf.FilialeId, f => f.PickRandom(filialen).Id)
                            .RuleFor(tf => tf.TierName, f => f.PickRandom(tiere).Name)
                            .RuleFor(tf => tf.Anzahl, f => f.Random.Number(anzahl) + 1);

            var result = new List<TierFiliale>();
            var combinations = new HashSet<string>();
            string currentCombination;

            for (int i = 0; i < count; i++) {
                TierFiliale generated;
                
                do {
                    generated = faker.Generate();
                    currentCombination = generated.FilialeId + generated.TierName;
                } while (!combinations.Add(currentCombination));

                result.Add(generated);
            }

            return result;
        }

        public void Seed(TierDbContext db, int tierCount, int filialeCount, int tierFilialeCount, int tierFilialeAnzahl) {
            var filialen = GenerateFilialen(filialeCount);
            var tiere = GenerateTiere(tierCount);
            var tierfilialen = GenerateTierFilialen(filialen, tiere, tierFilialeCount, tierFilialeAnzahl);

            db.Filialen.AddRange(filialen);
            db.SaveChanges();

            db.Tiere.AddRange(tiere);
            db.SaveChanges();

            db.TierFilialen.AddRange(tierfilialen);
            db.SaveChanges();
        }
    }
}
