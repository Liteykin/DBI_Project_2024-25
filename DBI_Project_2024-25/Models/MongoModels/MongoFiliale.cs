using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DBI_Project_2024_25.Models.MongoModels;

public class MongoFiliale
{
    public MongoFiliale(string id, string name, string adresse)
    {
        this.id = id;
        Name = name;
        Adresse = adresse;
    }

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string id { get; set; } = default!;

    [BsonElement("name")] public string Name { get; set; } = default!;
    [BsonElement("addresse")] public string Adresse { get; set; } = default!;
    [BsonElement("tierFilialen")] public ICollection<MongoTierFiliale> TierFiliale { get; set; } = new List<MongoTierFiliale>();
}