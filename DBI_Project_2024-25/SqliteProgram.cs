using DBI_Project_2024_25.Infrastructure;
using DBI_Project_2024_25.Models;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;

namespace DBI_Project_2024_25 {
    public class SqliteProgram : DatabaseProgram {
        public static WebApplication GenerateApp(WebApplicationBuilder builder) {
            builder.Services.AddDbContext<TierDbContext>(options => {
                if (builder.Environment.IsDevelopment()) {
                    options.EnableSensitiveDataLogging();
                }
                options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite"));
            });
            return GenerateSimpleApp(builder);
        }
    }
}
