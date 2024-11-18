using Newtonsoft.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

public class MongoFiliale
{
    public MongoFiliale() { }

    public MongoFiliale(string id, string name, string adresse)
    {
        Id = id;
        Name = name;
        Adresse = adresse;
    }

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonProperty("id")]
    public string Id { get; set; } = default!;

    [BsonElement("name")]
    [JsonProperty("name")]
    public string Name { get; set; } = default!;

    [BsonElement("adresse")] // Corrected from "addresse"
    [JsonProperty("adresse")]
    public string Adresse { get; set; } = default!;

    [BsonElement("tiere")]
    [JsonProperty("tiere")]
    public ICollection<MongoTier> Tiere { get; set; } = new List<MongoTier>();
}