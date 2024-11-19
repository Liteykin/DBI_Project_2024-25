using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace DBI_Project_2024_25.Infrastructure;

public class MongoDBConfiguration
{
    public string ConnectionMode { get; set; } = "Local";
    public string LocalConnectionString { get; set; } = "mongodb://localhost:27017";

    public string AtlasConnectionString { get; set; } =
        "mongodb+srv://liteykinmark:lWKP596b8zynKh58@cluster0.kfpsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    public string DatabaseName { get; set; } = "your_database_name";
}

public interface IMongoDBService
{
    IMongoDatabase GetDatabase();
    void SwitchConnectionMode(string mode);
    string GetCurrentConnectionMode();
}

public class MongoDBService : IMongoDBService
{
    private readonly MongoDBConfiguration _config;
    private IMongoClient _client;
    private readonly string _databaseName;

    public MongoDBService(IOptions<MongoDBConfiguration> options)
    {
        _config = options.Value;
        _databaseName = _config.DatabaseName;
        InitializeClient();
    }

    public IMongoDatabase GetDatabase()
    {
        return _client.GetDatabase(_databaseName);
    }

    public void SwitchConnectionMode(string mode)
    {
        if (mode != "Local" && mode != "Atlas")
            throw new ArgumentException("Mode must be either 'Local' or 'Atlas'");

        if (_config.ConnectionMode != mode)
        {
            _config.ConnectionMode = mode;
            InitializeClient();
        }
    }

    public string GetCurrentConnectionMode()
    {
        return _config.ConnectionMode;
    }

    private void InitializeClient()
    {
        var connectionString = _config.ConnectionMode == "Atlas"
            ? _config.AtlasConnectionString
            : _config.LocalConnectionString;

        _client = new MongoClient(connectionString);
    }
}